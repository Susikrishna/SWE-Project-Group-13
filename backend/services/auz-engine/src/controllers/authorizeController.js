const MfeRegistry = require("../models/mfeRegistry.model");
const { hasPermission } = require("../utils/accessProfile");
const { resolvePermission } = require("../utils/resolvePermission");

/**
 * GET /auth/authorize
 * Returns the massive flat permission arrays so the Gateway and 
 * Frontend React apps know exactly what the user is allowed to do.
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
