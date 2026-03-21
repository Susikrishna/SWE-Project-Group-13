const Role = require("../models/Role");

const createRole = async (req, res) => {
    try {
        const { name, description, permissions, mfeAccess, isTemp, expiresAt } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Role name is required" });
        }

        // Generate the custom string ID (e.g., "Support" -> "role_support")
        const roleId = `role_${name.trim().toLowerCase().replace(/\s+/g, "_")}`;

        // Check if role already exists using the new custom _id
        const prev = await Role.findById(roleId);
        if (prev) {
            return res.status(409).json({ error: `Role "${name}" already exists` });
        }

        // Validate the new flattened arrays
        if (permissions && !Array.isArray(permissions)) {
            return res.status(400).json({ error: "permissions must be an array of strings" });
        }
        if (mfeAccess && !Array.isArray(mfeAccess)) {
            return res.status(400).json({ error: "mfeAccess must be an array of strings" });
        }

        const role = await Role.create({
            _id: roleId,
            name: name.trim(),
            description,
            permissions: permissions ?? [],
            mfeAccess: mfeAccess ?? [],
            isTemp: isTemp ?? false,
            expiresAt: isTemp ? expiresAt : null,
        });

        res.status(201).json(role);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: `Role "${req.body.name}" already exists` });
        }
        res.status(400).json({ error: err.message });
    }
};

module.exports = { createRole };