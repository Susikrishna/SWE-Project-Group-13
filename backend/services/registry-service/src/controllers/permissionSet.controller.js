const PermissionSet = require("../models/permissionSet.model");
const MfeRegistry = require("../models/mfeRegistry.model");
const ApiRegistry = require("../models/apiRegistry.model");

const normalizeIdList = (value) => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(Boolean).map((id) => String(id).trim()))];
};

const buildAllowedPermissionMap = (mfes) => {
  const map = new Map();

  for (const mfe of mfes) {
    if (!mfe) continue;
    const mfeKey = String(mfe._id);
    const allowed = new Set();

    (mfe.allowedPermissions || []).forEach((key) => {
      if (key) allowed.add(String(key));
    });

    (mfe.components || []).forEach((component) => {
      (component.allowedPermissions || []).forEach((key) => {
        if (key) allowed.add(String(key));
      });
    });

    map.set(mfeKey, allowed);
  }

  return map;
};

const validateCoupling = async ({ mfeIds, apiIds }) => {
  if (apiIds.length > 0 && mfeIds.length === 0) {
    return {
      ok: false,
      message: "Each permission set API needs at least one corresponding MFE.",
    };
  }

  const [mfes, apis] = await Promise.all([
    MfeRegistry.find({ _id: { $in: mfeIds } }),
    ApiRegistry.find({ _id: { $in: apiIds } }),
  ]);

  if (mfes.length !== mfeIds.length) {
    return {
      ok: false,
      message: "One or more selected MFEs were not found in the registry.",
    };
  }

  if (apis.length !== apiIds.length) {
    return {
      ok: false,
      message: "One or more selected APIs were not found in the registry.",
    };
  }

  const allowedByMfe = buildAllowedPermissionMap(mfes);
  const mfePermissionUniverse = new Set();
  for (const allowed of allowedByMfe.values()) {
    allowed.forEach((key) => mfePermissionUniverse.add(key));
  }

  const invalidApis = apis.filter((api) => !mfePermissionUniverse.has(api.permissionKey));
  if (invalidApis.length > 0) {
    return {
      ok: false,
      message: `These APIs are not covered by any selected MFE: ${invalidApis.map((api) => api.permissionKey).join(", ")}`,
    };
  }

  return { ok: true, mfes, apis };
};

const populatePermissionSet = (doc) =>
  doc.populate([
    { path: "mfes", select: "feature name route module allowedPermissions components isActive" },
    { path: "apis", select: "service basePath route method resource action permissionKey isPublic isActive" },
  ]);

const createPermissionSet = async (req, res) => {
  try {
    let { name, description, mfes, apis, isActive } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Permission set name is required" });
    }

    const mfeIds = normalizeIdList(mfes);
    const apiIds = normalizeIdList(apis);

    const coupling = await validateCoupling({ mfeIds, apiIds });
    if (!coupling.ok) {
      return res.status(400).json({ error: coupling.message });
    }

    const permissionSet = await PermissionSet.create({
      name: String(name).trim(),
      description: description?.trim() || "",
      mfes: mfeIds,
      apis: apiIds,
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
    // Optional ?ids= comma-separated filter (used by auz-engine for batch resolution)
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
    let { name, description, mfes, apis, isActive } = req.body;

    const permissionSet = await PermissionSet.findById(id);
    if (!permissionSet) {
      return res.status(404).json({ error: "Permission set not found" });
    }

    const nextMfeIds = mfes !== undefined ? normalizeIdList(mfes) : permissionSet.mfes.map(String);
    const nextApiIds = apis !== undefined ? normalizeIdList(apis) : permissionSet.apis.map(String);

    const coupling = await validateCoupling({ mfeIds: nextMfeIds, apiIds: nextApiIds });
    if (!coupling.ok) {
      return res.status(400).json({ error: coupling.message });
    }

    if (name !== undefined) permissionSet.name = String(name).trim();
    if (description !== undefined) permissionSet.description = description?.trim() || "";
    if (mfes !== undefined) permissionSet.mfes = nextMfeIds;
    if (apis !== undefined) permissionSet.apis = nextApiIds;
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
