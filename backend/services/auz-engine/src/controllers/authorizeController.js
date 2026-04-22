const MfeRegistry = require("../models/mfeRegistry.model");
const { hasPermission } = require("../utils/accessProfile");
const { evaluateInlinePolicy } = require("../utils/abacEngine");
const { resolvePermission } = require("../utils/resolvePermission");

/**
 * GET /auth/authorize
 * Returns the full flat permission + MFE arrays for the requesting user.
 */
const authorize = async (req, res) => {
    const { userId, roleSummaries, mergedPermissions, mergedMfes } = req.accessProfile;

    const allowedMicrofrontends = await MfeRegistry.find({
        feature: { $in: mergedMfes },
    }).lean();

    return res.status(200).json({
        userId,
        role: roleSummaries[0] || null,
        roles: roleSummaries,
        permissions: mergedPermissions,
        microfrontends: allowedMicrofrontends,
    });
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
 * Two-phase check:
 *   Phase 1 — RBAC: does the user's merged permission list contain permissionKey?
 *   Phase 2 — ABAC (optional): if the caller sent a `policy` object in the body,
 *             evaluate its `allOf` conditions against the user's subject attributes.
 *             BOTH phases must pass for allowed=true.
 *
 * Request body shape:
 * {
 *   "permissionKey": "user-service:user:update",
 *   "context": { ... },           // optional — passed through to response
 *   "policy": {                    // optional — ABAC inline policy
 *     "allOf": [
 *       { "attribute": "subject.department",    "op": "eq",  "value": "finance" },
 *       { "attribute": "subject.clearanceLevel","op": "gte", "value": 5 }
 *     ]
 *   }
 * }
 */
const checkAccess = async (req, res) => {
    const { permissionKey, policy, context } = req.body || {};

    if (!permissionKey) {
        return res.status(400).json({ error: "permissionKey is required" });
    }

    // ── Phase 1: RBAC check ───────────────────────────────────────────────────
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

    // ── Phase 2: ABAC check (only if caller sent a policy) ───────────────────
    if (policy && Array.isArray(policy.allOf) && policy.allOf.length > 0) {
        const subjectAttributes = req.accessProfile.subjectAttributes || {};

        const { passed, failedConditions } = evaluateInlinePolicy(
            policy.allOf,
            subjectAttributes
        );

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

    // No inline policy — pure RBAC result
    return res.status(200).json({
        userId: req.accessProfile.userId,
        requiredPermission: permissionKey.toLowerCase(),
        allowed: true,
        reason: "RBAC_ALLOWED",
        abacEvaluated: false,
        context: context || null,
    });
 * Called by microservices internally to verify access for a specific URL.
 *
 * Request body:
 *   { url: "/api/v1/users/123", method: "GET" }
 *
 * The URL+method is decoded via the ApiRegistry to determine the
 * required permission string, then checked against the user's profile.
 */
const checkAccess = async (req, res) => {
  const { url, method } = req.body || {};

  if (!url || !method) {
    return res.status(400).json({ error: "Both 'url' and 'method' are required" });
  }

  // Resolve the URL to a permission key using the ApiRegistry
  const { permissionKey, isPublic, matched } = await resolvePermission(url, method);

  if (!matched) {
    return res.status(403).json({
      error: "Access Denied",
      detail: "Route not found in API Registry. Unrecognized endpoint.",
      url,
      method: method.toUpperCase(),
    });
  }

  // Public routes are always allowed
  if (isPublic) {
    return res.status(200).json({
      userId: req.accessProfile.userId,
      url,
      method: method.toUpperCase(),
      resolvedPermission: null,
      isPublic: true,
      allowed: true,
    });
  }

  const allowed = hasPermission(req.accessProfile, permissionKey);
  
  return res.status(200).json({
    userId: req.accessProfile.userId,
    url,
    method: method.toUpperCase(),
    resolvedPermission: permissionKey,
    isPublic: false,
    allowed,
  });
};

module.exports = { authorize, checkAccess };
