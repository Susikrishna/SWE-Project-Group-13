const MfeRegistry = require("../models/mfeRegistry.model");
const { hasPermission } = require("../utils/accessProfile");
const { evaluateInlinePolicy } = require("../utils/abacEngine");

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
};

module.exports = { authorize, checkAccess };
