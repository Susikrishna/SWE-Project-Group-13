const ServiceRegistry = require("../models/RegistryModel");
const { hasPermission } = require("../utils/accessProfile");

/**
 * GET /auth/authorize
 *
 * Reads the verified JWT payload attached by verifyToken middleware,
 * looks up the role in MongoDB, populates the allowed services from the
 * registry, then returns a structured authorization response.
 *
 * Response shape:
 * {
 *   "userId": "...",
 *   "role": { "id": "...", "name": "...", "description": "...", "isTemp": false },
 *   "microservices": [
 *     {
 *       "serviceId": "...",
 *       "serviceName": "...",
 *       "serviceIdentifier": "...",
 *       "baseUrl": "...",
 *       "allowedActions": ["read", "write"],
 *       "exposedPermissions": [...]
 *     }
 *   ],
 *   "microfrontends": [ ... same shape ... ]
 * }
 */
const authorize = async (req, res) => {
  const accessProfile = req.accessProfile;
  const { userId, roleSummaries, mergedAllowedServices, permissionsByService } = accessProfile;

  // ── 1. No services assigned? Return early ──────────────────────────────────
  if (!mergedAllowedServices || mergedAllowedServices.length === 0) {
    return res.status(200).json({
      userId,
      role: roleSummaries[0] || null,
      roles: roleSummaries,
      permissionsByService,
      microservices: [],
      microfrontends: [],
    });
  }

  // ── 2. Fetch all referenced registry entries in one query ──────────────────
  const serviceIds = mergedAllowedServices.map((s) => s.serviceId);
  const registryEntries = await ServiceRegistry.find({
    _id: { $in: serviceIds },
    isActive: true,
  }).lean();

  // Index registry entries by their string ID for O(1) lookup
  const registryById = Object.fromEntries(
    registryEntries.map((entry) => [entry._id.toString(), entry])
  );

  // ── 3. Build response arrays, split by serviceType ─────────────────────────
  const microservices = [];
  const microfrontends = [];

  for (const { serviceId, actions } of mergedAllowedServices) {
    const entry = registryById[serviceId.toString()];

    // Skip if the service doesn't exist or was deactivated
    if (!entry) continue;

    const servicePayload = buildServicePayload(entry, actions);

    if (entry.serviceType === "microservice") {
      microservices.push(servicePayload);
    } else if (entry.serviceType === "microfrontend") {
      microfrontends.push(servicePayload);
    }
  }

  // ── 4. Respond ──────────────────────────────────────────────────────────────
  return res.status(200).json({
    userId,
    role: roleSummaries[0] || null,
    roles: roleSummaries,
    permissionsByService,
    microservices,
    microfrontends,
  });
};

const checkAccess = async (req, res) => {
  const { serviceId, action } = req.body || {};

  if (!serviceId || !action) {
    return res.status(400).json({
      error: "Both serviceId and action are required",
    });
  }

  const allowed = hasPermission(req.accessProfile, serviceId, action);

  return res.status(200).json({
    userId: req.accessProfile.userId,
    required: { serviceId: String(serviceId), action: String(action).toLowerCase() },
    allowed,
  });
};

function buildServicePayload(entry, allowedActions) {
  return {
    serviceId: entry._id,
    serviceName: entry.serviceName,
    serviceIdentifier: entry.serviceIdentifier,
    description: entry.description || null,
    baseUrl: entry.baseUrl,
    allowedActions,                    // actions this role may perform
    exposedPermissions: entry.exposedPermissions, // all declared permissions on the service
  };
}

module.exports = { authorize, checkAccess };
