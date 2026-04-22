const MfeRegistry = require("../models/mfeRegistry.model");
const { hasPermission } = require("../utils/accessProfile");
const { evaluateInlinePolicy } = require("../utils/abacEngine");
const { resolvePermission } = require("../utils/resolvePermission");

/**
 * GET /auth/authorize
 * Returns the full flat permission + MFE arrays for the requesting user.
 * Filters for active MFEs and active sub-components.
 */
const authorize = async (req, res) => {
  const { userId, roleSummaries, mergedPermissions, mergedMfes } = req.accessProfile;

  // Fetch current active MFE registry entries so the React shell knows what to load.
  const allowedMicrofrontends = await MfeRegistry.find({
    feature: { $in: mergedMfes },
    isActive: { $ne: false },
  }).lean();

  const activeMicrofrontends = allowedMicrofrontends.map((mfe) => ({
    ...mfe,
    components: (mfe.components || []).filter((component) => component.isActive !== false),
  }));

  return res.status(200).json({
    userId,
    role: roleSummaries[0] || null,
    roles: roleSummaries,
    permissions: mergedPermissions, // e.g. ["user-svc:profile:read"]
    microfrontends: activeMicrofrontends, // Sends back route/remoteUrl/module plus permission mappings
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
