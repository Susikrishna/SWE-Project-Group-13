const MfeRegistry = require("../models/mfeRegistry.model");

/**
 * Registers a new Microfrontend for Role-based UI access.
 */
const createMfe = async (req, res) => {
  try {
    let { feature, name, description, route,comps,remoteUrl, module, isActive } = req.body;
    
    // Validate that all required fields are present
    if (!feature || !name || !route || !remoteUrl || !module) {
      return res.status(400).json({ error: "Missing required MFE fields" });
    }
    
    // Normalize the feature slug as it will be used directly in Role mfeAccess arrays
    feature = feature.trim().toLowerCase();
    
    // Create the MFE record in the database
    const mfe = await MfeRegistry.create({
      feature,
      name: name.trim(),
      description: description?.trim(),
      route: route.trim(),
      components: comps,
      remoteUrl: remoteUrl.trim(),
      module: module.trim(),
      isActive: isActive ?? true,
    });

    res.status(201).json(mfe);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "An MFE with this Feature slug already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieves all registered MFEs, sorted newest first.
 */
const getMfes = async (req, res) => {
  try {
    const mfes = await MfeRegistry.find().sort({ createdAt: -1 });
    res.json(mfes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createMfe, getMfes };