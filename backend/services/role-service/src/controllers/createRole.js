const Role = require("../models/Role");
const MfeRegistry = require("../models/MfeRegistry");

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

        // Hard Restriction Validation
        if (mfeAccess && mfeAccess.length > 0) {
            const selectedFeatureIds = Array.from(new Set(mfeAccess.map(key => key.split("::")[0])));
            const registries = await MfeRegistry.find({ feature: { $in: selectedFeatureIds } });
            
            const whitelist = new Set();
            registries.forEach(reg => {
                // Fallback to MFE root permissions if any
                if (reg.allowedPermissions) {
                    reg.allowedPermissions.forEach(p => whitelist.add(p));
                }
                // Include component-level permissions
                if (reg.components && Array.isArray(reg.components)) {
                    reg.components.forEach(comp => {
                        if (comp.allowedPermissions) {
                            comp.allowedPermissions.forEach(p => whitelist.add(p));
                        }
                    });
                }
            });

            const unauthorized = permissions.filter(p => !whitelist.has(p));
            if (unauthorized.length > 0) {
                return res.status(403).json({ 
                    error: "Hard Restriction Violation", 
                    details: `The following permissions are not authorized by the selected MFEs: ${unauthorized.join(", ")}` 
                });
            }
        } else if (permissions && permissions.length > 0) {
            return res.status(403).json({ error: "Hard Restriction Violation", details: "Permissions cannot be assigned without at least one associated MFE." });
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