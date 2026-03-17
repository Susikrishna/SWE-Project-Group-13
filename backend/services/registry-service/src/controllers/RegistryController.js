const { ApiRegistry, MfeRegistry } = require("../models/RegistryModel");

const createRegistryEntry = async (req, res) => {
  try {
    const {
      serviceName,
      serviceIdentifier,
      serviceType,
      baseUrl,
      endpoints = [],
      route,
      remoteUrl,
      moduleName,
      isActive = true,
    } = req.body;

    // 1. Universal Validation
    if (!serviceName || !serviceIdentifier || !serviceType) {
      return res.status(400).json({
        error: "serviceName, serviceIdentifier, and serviceType are required",
      });
    }

    const identifier = serviceIdentifier.trim().toLowerCase();

    // 2. Check for duplicates across BOTH tables
    const prevApi = await ApiRegistry.findOne({
      serviceIdentifier: identifier,
    });
    const prevMfe = await MfeRegistry.findOne({
      serviceIdentifier: identifier,
    });

    if (prevApi || prevMfe) {
      return res.status(409).json({
        error: `Service "${identifier}" is already registered`,
      });
    }

    let entry;

    // 3. Route to the correct MongoDB Collection
    if (serviceType === "microservice") {
      if (!baseUrl)
        return res
          .status(400)
          .json({ error: "baseUrl is required for microservices" });

      const cleanedEndpoints = endpoints.filter(
        (ep) => ep.path && ep.path.trim() && ep.resource && ep.resource.trim(),
      );

      entry = await ApiRegistry.create({
        serviceName: serviceName.trim(),
        serviceIdentifier: identifier,
        serviceType,
        baseUrl: baseUrl.trim(),
        endpoints: cleanedEndpoints,
        isActive,
      });
    } else if (serviceType === "microfrontend") {
      if (!route || !remoteUrl || !moduleName) {
        return res.status(400).json({
          error:
            "route, remoteUrl, and moduleName are required for microfrontends",
        });
      }

      entry = await MfeRegistry.create({
        serviceName: serviceName.trim(),
        serviceIdentifier: identifier, // e.g., "admin-dashboard"
        serviceType,
        route: route.trim(),
        remoteUrl: remoteUrl.trim(),
        moduleName: moduleName.trim(),

        // Auto-generate the permission string!
        requiredPermission: `ui.${identifier}.view`,
        isActive,
      });
    } else {
      return res.status(400).json({ error: "Invalid serviceType" });
    }

    res.status(201).json({
      message: "Service registered successfully",
      data: entry,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRegistries = async (req, res) => {
  try {
    // 1. Fetch from both collections
    const apis = await ApiRegistry.find().lean();
    const mfes = await MfeRegistry.find().lean();

    // 2. Merge and sort them (Newest first)
    let entries = [...apis, ...mfes].sort((a, b) => b.createdAt - a.createdAt);

    // 3. Apply standard pagination to the merged array
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const total = entries.length;

    const skip = (page - 1) * limit;
    entries = entries.slice(skip, skip + limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: entries,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createRegistryEntry,
  getRegistries,
};
