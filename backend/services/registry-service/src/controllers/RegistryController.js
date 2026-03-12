const ServiceRegistry = require("../models/RegistryModel");

const createRegistryEntry = async (req, res) => {
  try {
    const {
      serviceName,
      serviceIdentifier,
      serviceType,
      baseUrl,
      exposedPermissions = [],
      isActive = true,
    } = req.body;

    // Basic validation
    if (!serviceName || !serviceIdentifier || !serviceType || !baseUrl) {
      return res.status(400).json({
        error:
          "serviceName, serviceIdentifier, serviceType and baseUrl are required",
      });
    }

    const identifier = serviceIdentifier.trim().toLowerCase();

    const prev = await ServiceRegistry.findOne({
      serviceIdentifier: identifier,
    });

    if (prev) {
      return res.status(409).json({
        error: `Service "${identifier}" is already registered`,
      });
    }

    // Filter invalid permissions
    const cleanedPermissions = exposedPermissions.filter(
      (p) => p.resource && p.resource.trim() && p.action && p.action.trim(),
    );

    const entry = await ServiceRegistry.create({
      serviceName: serviceName.trim(),
      serviceIdentifier: identifier,
      serviceType,
      baseUrl: baseUrl.trim(),
      exposedPermissions: cleanedPermissions,
      isActive,
    });

    res.status(201).json({
      message: "Service registered successfully",
      data: entry,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const getRegistries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const entries = await ServiceRegistry.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ServiceRegistry.countDocuments();

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: entries,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

module.exports = {
  createRegistryEntry,
  getRegistries,
};
