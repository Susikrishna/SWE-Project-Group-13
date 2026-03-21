const MfeRegistry = require("../models/mfeRegistry.model");

/**
 * Registers a new Microfrontend for Role-based UI access.
 */
const createMfe = async (req, res) => {
  try {
    // Destructure 'feature' instead of 'featureId'
    let { feature, name, route, remoteUrl, module } = req.body;

    // Validate that all required fields are present
    if (!feature || !name || !route || !remoteUrl || !module) {
      return res.status(400).json({ error: "Missing required MFE fields" });
    }

    // Normalize the feature slug as it will be used directly in Role mfeAccess arrays
    feature = feature.trim().toLowerCase();

    // Create the MFE record in the database
    const mfe = await MfeRegistry.create({
      feature,
      name,
      route,
      remoteUrl,
      module,
    });

    res.status(201).json(mfe);
  } catch (err) {
    // Handle MongoDB duplicate key error (11000) for the 'feature' field
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