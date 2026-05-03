
const { hasPermission } = require("../utils/accessProfile");
const { evaluateInlinePolicy } = require("../utils/abacEngine");
const { resolvePermission } = require("../utils/resolvePermission");

const authorize = async (req, res) => {
  const { userId, roleSummaries, allowedMicrofrontends } = req.accessProfile;

  return res.status(200).json({
    userId,
    role: roleSummaries[0] || null,
    roles: roleSummaries,
    microfrontends: allowedMicrofrontends,
  });
};

/**
 * POST /auth/check-access
 *
 * Hybrid check:
 * 1. If 'url' and 'method' are provided, resolve them to a permissionKey via the ApiRegistry.
 * 2. If 'permissionKey' is provided directly (or resolved from URL), perform RBAC check.
 * 3. Perform optional ABAC check if an inline 'policy' is provided.
 */
const checkAccess = async (req, res) => {
  let { permissionKey, policy, context, url, method } = req.body || {};

  // ── Step 1: Resolve URL if provided ─────────────────────────────────────────
  if (url && method) {
    const resolution = await resolvePermission(url, method);
    if (!resolution.matched) {
      return res.status(403).json({
        error: "Access Denied",
        detail: "Route not found in API Registry.",
        url,
        method: method.toUpperCase(),
      });
    }
    if (resolution.isPublic) {
      return res.status(200).json({
        userId: req.accessProfile.userId,
        url,
        method: method.toUpperCase(),
        isPublic: true,
        allowed: true,
      });
    }
    permissionKey = resolution.permissionKey;
  }

  if (!permissionKey) {
    return res.status(400).json({ error: "permissionKey (or url+method) is required" });
  }

  // ── Step 2: RBAC check ──────────────────────────────────────────────────────
  const rbacAllowed = hasPermission(req.accessProfile, permissionKey);

  if (!rbacAllowed) {
    return res.status(200).json({
      userId: req.accessProfile.userId,
      requiredPermission: permissionKey.toLowerCase(),
      allowed: false,
      reason: "RBAC_DENIED — permission not in role",
      abacEvaluated: false,
    });
  }

  // ── Step 3: ABAC check (optional) ───────────────────────────────────────────
  if (policy && Array.isArray(policy.allOf) && policy.allOf.length > 0) {
    const subjectAttributes = req.accessProfile.subjectAttributes || {};
    const { passed, failedConditions } = evaluateInlinePolicy(policy.allOf, subjectAttributes);

    if (!passed) {
      return res.status(200).json({
        userId: req.accessProfile.userId,
        requiredPermission: permissionKey.toLowerCase(),
        allowed: false,
        reason: "ABAC_DENIED — attribute conditions not satisfied",
        failedConditions,
        abacEvaluated: true,
      });
    }

    return res.status(200).json({
      userId: req.accessProfile.userId,
      requiredPermission: permissionKey.toLowerCase(),
      allowed: true,
      reason: "RBAC_ALLOWED + ABAC_PASSED",
      abacEvaluated: true,
      context: context || null,
    });
  }

  // Pure RBAC result
  return res.status(200).json({
    userId: req.accessProfile.userId,
    requiredPermission: permissionKey.toLowerCase(),
    allowed: true,
    reason: "RBAC_ALLOWED",
    abacEvaluated: false,
    context: context || null,
  });
};

module.exports = { authorize, checkAccess };
