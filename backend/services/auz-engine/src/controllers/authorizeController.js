const MfeRegistry = require("../models/mfeRegistry.model");
const { hasPermission } = require("../utils/accessProfile");

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
 */
const checkAccess = async (req, res) => {
  const { permissionKey } = req.body || {};

  if (!permissionKey) {
    return res.status(400).json({ error: "permissionKey is required" });
  }

  const allowed = hasPermission(req.accessProfile, permissionKey);

  return res.status(200).json({
    userId: req.accessProfile.userId,
    requiredPermission: permissionKey.toLowerCase(),
    allowed,
  });
};

module.exports = { authorize, checkAccess };