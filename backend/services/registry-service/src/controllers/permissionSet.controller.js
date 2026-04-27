const PermissionSet = require("../models/permissionSet.model");

/**
 * Create a new Permission Set.
 */
const createPermissionSet = async (req, res) => {
  try {
    const { name, description, permissions, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Permission Set name is required" });
    }

    if (permissions && !Array.isArray(permissions)) {
      return res.status(400).json({ error: "permissions must be an array of strings" });
    }

    const set = await PermissionSet.create({
      name: name.trim(),
      description: description?.trim(),
      permissions: permissions ?? [],
      isActive: isActive ?? true,
    });

    res.status(201).json(set);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: `A Permission Set named "${req.body.name}" already exists` });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieve all Permission Sets.
 */
const getPermissionSets = async (req, res) => {
  try {
    const sets = await PermissionSet.find().sort({ createdAt: -1 });
    res.json(sets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieve a single Permission Set by ID.
 */
const getPermissionSetById = async (req, res) => {
  try {
    const set = await PermissionSet.findById(req.params.id);
    if (!set) return res.status(404).json({ error: "Permission Set not found" });
    res.json(set);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update a Permission Set (name, description, permissions, isActive).
 */
const updatePermissionSet = async (req, res) => {
  try {
    const { name, description, permissions, isActive } = req.body;
    const update = {};

    if (name !== undefined) update.name = name.trim();
    if (description !== undefined) update.description = description?.trim();
    if (permissions !== undefined) {
      if (!Array.isArray(permissions)) {
        return res.status(400).json({ error: "permissions must be an array of strings" });
      }
      update.permissions = permissions;
    }
    if (isActive !== undefined) update.isActive = isActive;

    const set = await PermissionSet.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!set) return res.status(404).json({ error: "Permission Set not found" });

    res.json(set);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: `A Permission Set with that name already exists` });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete a Permission Set by ID.
 */
const deletePermissionSet = async (req, res) => {
  try {
    const set = await PermissionSet.findByIdAndDelete(req.params.id);
    if (!set) return res.status(404).json({ error: "Permission Set not found" });
    res.json({ message: "Permission Set deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Resolve multiple Permission Set IDs → merged permissions array.
 * Used internally by role-service for cross-service validation.
 * POST /registry/permission-sets/resolve  { ids: [...] }
 */
const resolvePermissionSets = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "ids must be an array of Permission Set IDs" });
    }
    const sets = await PermissionSet.find({ _id: { $in: ids } });
    const merged = [...new Set(sets.flatMap((s) => s.permissions))];
    res.json({ permissions: merged, sets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPermissionSet,
  getPermissionSets,
  getPermissionSetById,
  updatePermissionSet,
  deletePermissionSet,
  resolvePermissionSets,
};
