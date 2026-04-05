const ApiRegistry = require("../models/apiRegistry.model");

/**
 * Creates a single API endpoint entry and generates its RBAC permission key.
 */
const createApi = async (req, res) => {
  try {
    let { service, basePath, route, method, description, resource, action, isPublic, isActive } = req.body;

    if (!service || !basePath || !route || !method || !resource || !action) {
      return res.status(400).json({ error: "Missing required API fields" });
    }

    // Normalize data to prevent case-sensitivity mismatches in RBAC checks
    service = service.trim().toLowerCase();
    basePath = basePath.trim();
    route = route.trim();
    method = method.trim().toUpperCase();
    resource = resource.trim().toLowerCase();
    action = action.trim().toLowerCase();

    // Generate the standardized RBAC key (e.g., 'user-svc:profile:update')
    const permissionKey = `${service}:${resource}:${action}`;

    const api = await ApiRegistry.create({
      service,
      basePath,
      route,
      method,
      description: description?.trim(),
      resource,
      action,
      permissionKey,
      isPublic: isPublic ?? false,
      isActive: isActive ?? true, // Defaults to true if not provided
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
    // basePath can be provided once for the whole service, or inside each API object
    const { service, basePath, apis } = req.body; 
    
    if (!service || !Array.isArray(apis) || apis.length === 0) {
      return res.status(400).json({ error: "Service identifier and an array of APIs are required" });
    }
    
    const normalizedService = service.trim().toLowerCase();
    
    const documents = apis
      // Ensure we have a basePath (either from the top level or the api item)
      .filter(api => (api.basePath || basePath) && api.route && api.method && api.resource && api.action)
      .map(api => {
        const resource = api.resource.trim().toLowerCase();
        const action = api.action.trim().toLowerCase();
        
        return {
          service: normalizedService,
          basePath: (api.basePath || basePath).trim(),
          route: api.route.trim(),
          method: api.method.trim().toUpperCase(),
          description: api.description?.trim(),
          resource,
          action,
          permissionKey: `${normalizedService}:${resource}:${action}`,
          isPublic: api.isPublic ?? false,
          isActive: api.isActive ?? true,
        };
      });
    
    if (documents.length === 0) {
      return res.status(400).json({ error: "No valid API configurations provided" });
    }

    // ordered: false ensures the DB skips existing routes and inserts the rest without crashing
    const result = await ApiRegistry.insertMany(documents, { ordered: false });
    
    res.status(201).json({
      message: "Bulk API registration complete",
      insertedCount: result.length,
      data: result,
    });
  } catch (err) {
    if (err.code === 11000 || err.name === "BulkWriteError") {
      const inserted = err.result?.nInserted ?? 0;
      const writeErrors = err.writeErrors?.map(e => ({
        index: e.index,
        message: e.errmsg,
      })) ?? [];

      return res.status(207).json({  // 207 = Multi-Status (partial success)
        message: "Bulk insert partially completed",
        insertedCount: inserted,
        skippedCount: writeErrors.length,
        errors: writeErrors,
      });
    }

    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieves all registered APIs, sorted newest first.
 */
const getApis = async (req, res) => {
  try {
    const apis = await ApiRegistry.find().sort({ createdAt: -1 });
    console.log(apis)
    res.json(apis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createApi, createBulkApis, getApis };