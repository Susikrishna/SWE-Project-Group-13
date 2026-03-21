const ApiRegistry = require("../models/apiRegistry.model");

/**
 * Creates a single API endpoint entry and generates its RBAC permission key.
 */
const createApi = async (req, res) => {
  try {
    let { service, path, method, resource, action, isPublic } = req.body;

    if (!service || !path || !method || !resource || !action) {
      return res.status(400).json({ error: "Missing required API fields" });
    }

    // Normalize data to prevent case-sensitivity mismatches in RBAC checks
    service = service.trim().toLowerCase();
    path = path.trim();
    method = method.toUpperCase();
    resource = resource.trim().toLowerCase();
    action = action.trim().toLowerCase();

    // Generate the standardized RBAC key (e.g., 'user-svc:profile:update')
    const permissionKey = `${service}:${resource}:${action}`;

    const api = await ApiRegistry.create({
      service,
      path,
      method,
      resource,
      action,
      permissionKey,
      isPublic: isPublic ?? false,
    });

    res.status(201).json(api);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "API endpoint already exists in the registry" });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Bulk registers multiple API endpoints for a specific microservice.
 * Skips duplicates automatically.
 */
const createBulkApis = async (req, res) => {
  try {
    const { service, apis } = req.body;

    if (!service || !Array.isArray(apis) || apis.length === 0) {
      return res.status(400).json({ error: "Service identifier and an array of APIs are required" });
    }

    const normalizedService = service.trim().toLowerCase();

    const documents = apis
      .filter(api => api.path && api.method && api.resource && api.action)
      .map(api => {
        const resource = api.resource.trim().toLowerCase();
        const action = api.action.trim().toLowerCase();

        return {
          service: normalizedService,
          path: api.path.trim(),
          method: api.method.toUpperCase(),
          resource,
          action,
          permissionKey: `${normalizedService}:${resource}:${action}`,
          isPublic: api.isPublic ?? false,
        };
      });

    if (documents.length === 0) {
      return res.status(400).json({ error: "No valid API configurations provided" });
    }

    // ordered: false ensures the DB skips existing paths and inserts the rest
    const result = await ApiRegistry.insertMany(documents, { ordered: false });

    res.status(201).json({
      message: "Bulk API registration complete",
      insertedCount: result.length,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieves all registered APIs, sorted newest first.
 */
const getApis = async (req, res) => {
  try {
    const apis = await ApiRegistry.find().sort({ createdAt: -1 });
    res.json(apis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createApi, createBulkApis, getApis };