const PermissionSet = require("../models/permissionSet.model");
const MfeRegistry = require("../models/mfeRegistry.model");

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalize the incoming `mfes` array into the shape stored in MongoDB.
 * Input:  [{ mfeId: "...", components: ["/billing"] }]
 * Output: [{ mfeId: "...", components: ["/billing"] }]  (deduped + trimmed)
 */
const normalizeMfes = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => entry && entry.mfeId)
    .map((entry) => ({
      mfeId: String(entry.mfeId).trim(),
      components: Array.isArray(entry.components)
        ? [...new Set(entry.components.filter(Boolean).map((c) => String(c).trim()))]
        : [],
    }));
};

/**
 * Populates the mfeId reference within each entry of the mfes array.
 */
const populatePermissionSet = (doc) =>
  doc.populate({
    path: "mfes.mfeId",
    model: "MfeRegistry",
    select: "feature name route module allowedPermissions components isActive",
  });

// ── Validate that all provided mfeIds actually exist ─────────────────────────
const validateMfeIds = async (normalizedMfes) => {
  const ids = normalizedMfes.map((m) => m.mfeId);
  const found = await MfeRegistry.find({ _id: { $in: ids } }).select("_id");
  if (found.length !== ids.length) {
    return { ok: false, message: "One or more selected MFEs were not found in the registry." };
  }
  return { ok: true };
};

// ── Controller Methods ────────────────────────────────────────────────────────

const createPermissionSet = async (req, res) => {
  try {
    const { name, description, mfes, isActive } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Permission set name is required" });
    }

    const normalizedMfes = normalizeMfes(mfes);

    const validation = await validateMfeIds(normalizedMfes);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.message });
    }

    const permissionSet = await PermissionSet.create({
      name: String(name).trim(),
      description: description?.trim() || "",
      mfes: normalizedMfes,
      isActive: isActive ?? true,
    });

    const populated = await populatePermissionSet(permissionSet);
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: `Permission set "${req.body.name}" already exists` });
    }
    res.status(500).json({ error: err.message });
  }
};

const getPermissionSets = async (req, res) => {
  try {
    const { ids } = req.query;
    const filter = ids
      ? { _id: { $in: ids.split(",").map((s) => s.trim()).filter(Boolean) } }
      : {};

    const permissionSets = await PermissionSet.find(filter).sort({ createdAt: -1 });
    const populated = await Promise.all(permissionSets.map((set) => populatePermissionSet(set)));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePermissionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, mfes, isActive } = req.body;

    const permissionSet = await PermissionSet.findById(id);
    if (!permissionSet) {
      return res.status(404).json({ error: "Permission set not found" });
    }

    if (mfes !== undefined) {
      const normalizedMfes = normalizeMfes(mfes);
      const validation = await validateMfeIds(normalizedMfes);
      if (!validation.ok) {
        return res.status(400).json({ error: validation.message });
      }
      permissionSet.mfes = normalizedMfes;
    }

    if (name !== undefined) permissionSet.name = String(name).trim();
    if (description !== undefined) permissionSet.description = description?.trim() || "";
    if (isActive !== undefined) permissionSet.isActive = isActive;

    await permissionSet.save();
    const populated = await populatePermissionSet(permissionSet);
    res.json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: `Permission set "${req.body.name}" already exists` });
    }
    res.status(500).json({ error: err.message });
  }
};

const deletePermissionSet = async (req, res) => {
  try {
    const deleted = await PermissionSet.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Permission set not found" });
    }
    res.json({ message: "Permission set deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPermissionSet,
  getPermissionSets,
  updatePermissionSet,
  deletePermissionSet,
};
