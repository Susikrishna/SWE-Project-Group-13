const MfeRegistry = require("../models/mfeRegistry.model");

/**
 * Registers a new Microfrontend for Role-based UI access.
 */
const createMfe = async (req, res) => {
  try {
    let { feature, name, description, route, comps, remoteUrl, module, isActive, allowedPermissions } = req.body;
    
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
      components: comps || [],
      allowedPermissions: allowedPermissions || [],
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

/**
 * Updates an existing MFE registry entry by ID.
 * Restricted to safe fields so as not to break the core integration.
 */
const updateMfe = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, route, remoteUrl, module, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (route !== undefined) updateData.route = route.trim();
    if (remoteUrl !== undefined) updateData.remoteUrl = remoteUrl.trim();
    if (module !== undefined) updateData.module = module.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const mfe = await MfeRegistry.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!mfe) {
      return res.status(404).json({ error: "MFE not found" });
    }

    res.json(mfe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Searches MFEs by a query string, returning top 10 matches.
 */
const searchMfes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const regex = new RegExp(q, 'i');
    const mfes = await MfeRegistry.find({
      $or: [
        { name: regex },
        { feature: regex },
        { route: regex },
        { module: regex },
        { description: regex }
      ]
    }).limit(10).sort({ createdAt: -1 });
    res.json(mfes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createMfe, getMfes, updateMfe, searchMfes };