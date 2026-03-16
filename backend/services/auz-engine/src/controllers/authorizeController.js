const mongoose = require("mongoose");
const Role = require("../models/Role");
const ServiceRegistry = require("../models/RegistryModel");

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
  const { userId, roleId } = req.tokenPayload;

  // ── 1. Validate roleId ──────────────────────────────────────────────────────
  if (!roleId || !mongoose.Types.ObjectId.isValid(roleId)) {
    return res.status(400).json({
      error: "Token payload is missing a valid 'roleId' field",
    });
  }

  // ── 2. Fetch the role ───────────────────────────────────────────────────────
  const role = await Role.findById(roleId).lean();
  if (!role) {
    return res.status(404).json({ error: `Role '${roleId}' not found` });
  }

  // ── 3. Check temporary role validity ───────────────────────────────────────
  if (role.isTemp) {
    const now = new Date();
    if (now < new Date(role.startDate) || now > new Date(role.endDate)) {
      return res.status(403).json({
        error: "Temporary role is outside its valid date range",
        validFrom: role.startDate,
        validUntil: role.endDate,
      });
    }
  }

  // ── 4. No services assigned? Return early ──────────────────────────────────
  if (!role.allowedServices || role.allowedServices.length === 0) {
    return res.status(200).json({
      userId,
      role: buildRoleSummary(role),
      microservices: [],
      microfrontends: [],
    });
  }

  // ── 5. Fetch all referenced registry entries in one query ──────────────────
  const serviceIds = role.allowedServices.map((s) => s.serviceId);
  const registryEntries = await ServiceRegistry.find({
    _id: { $in: serviceIds },
    isActive: true,
  }).lean();

  // Index registry entries by their string ID for O(1) lookup
  const registryById = Object.fromEntries(
    registryEntries.map((entry) => [entry._id.toString(), entry])
  );

  // ── 6. Build response arrays, split by serviceType ─────────────────────────
  const microservices = [];
  const microfrontends = [];

  for (const { serviceId, actions } of role.allowedServices) {
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

  // ── 7. Respond ──────────────────────────────────────────────────────────────
  return res.status(200).json({
    userId,
    role: buildRoleSummary(role),
    microservices,
    microfrontends,
  });
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildRoleSummary(role) {
  return {
    id: role._id,
    name: role.name,
    description: role.description || null,
    isTemp: role.isTemp,
    ...(role.isTemp && { validFrom: role.startDate, validUntil: role.endDate }),
  };
}

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

module.exports = { authorize };
