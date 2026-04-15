const MfeRegistry = require("../models/mfeRegistry.model");
const { hasPermission } = require("../utils/accessProfile");
const { resolvePermissionFromUrl } = require("../utils/resolvePermission");

/**
 * GET /auth/authorize
 * Returns the massive flat permission arrays so the Gateway and 
 * Frontend React apps know exactly what the user is allowed to do.
 */
const authorize = async (req, res) => {
  const { userId, roleSummaries, mergedPermissions, mergedMfes } = req.accessProfile;

  // We must fetch MFE Registry data so the React Shell knows the "remoteUrls" to load
  const allowedMicrofrontends = await MfeRegistry.find({
    feature: { $in: mergedMfes }
  }).lean();

  return res.status(200).json({
    userId,
    role: roleSummaries[0] || null,
    roles: roleSummaries,
    permissions: mergedPermissions, // e.g. ["user-svc:profile:read"]
    microfrontends: allowedMicrofrontends, // Sends back the full object with route/remoteUrl/module
  });
};

/**
 * POST /auth/check-access
 * Called by microservices internally to quickly verify a specific action.
 * 
 * Accepts EITHER:
 *   { url: "/api/v1/users/123", method: "PUT" }   — resolves permission from ApiRegistry
 *   { permissionKey: "user-service:user:update" }  — legacy direct mode (backward compatible)
 */
const checkAccess = async (req, res) => {
  const { url, method, permissionKey } = req.body || {};

  let resolvedKey = permissionKey;

  // URL-based resolution (primary flow)
  if (url && method) {
    const result = await resolvePermissionFromUrl(url, method);

    if (!result.matched) {
      return res.status(404).json({
        error: "Route not found in API Registry",
        detail: `No registered route matches ${method.toUpperCase()} ${url}`,
      });
    }

    if (result.isPublic) {
      return res.status(200).json({
        userId: req.accessProfile.userId,
        requiredPermission: null,
        allowed: true,
        note: "Route is public — no permission check needed.",
      });
    }

    resolvedKey = result.permissionKey;
  }

  if (!resolvedKey) {
    return res.status(400).json({
      error: "Provide either { url, method } or { permissionKey }",
    });
  }

  const allowed = hasPermission(req.accessProfile, resolvedKey);

  return res.status(200).json({
    userId: req.accessProfile.userId,
    requiredPermission: resolvedKey.toLowerCase(),
    allowed,
  });
};

module.exports = { authorize, checkAccess };