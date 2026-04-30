const Role = require("../models/Role");

const createRole = async (req, res) => {
    try {
        const { name, description, permissionSets, isTemp, expiresAt, abacPolicies } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Role name is required" });
        }

        const roleId = `role_${name.trim().toLowerCase().replace(/\s+/g, "_")}`;

        const prev = await Role.findById(roleId);
        if (prev) {
            return res.status(409).json({ error: `Role "${name}" already exists` });
        }


        if (permissionSets && !Array.isArray(permissionSets)) {
            return res.status(400).json({ error: "permissionSets must be an array of ObjectId strings" });
        }

        // ── Validate abacPolicies structure ────────────────────────────────
        if (abacPolicies && !Array.isArray(abacPolicies)) {
            return res.status(400).json({ error: "abacPolicies must be an array" });
        }

        const VALID_OPERATORS = ["eq", "neq", "in", "nin", "gte_clearance"];
        if (abacPolicies) {
            for (const policy of abacPolicies) {
                if (!policy.permissionKey) {
                    return res.status(400).json({ error: "Each abacPolicy must have a permissionKey" });
                }
                for (const cond of (policy.conditions || [])) {
                    if (!cond.attribute || !cond.operator || cond.value === undefined) {
                        return res.status(400).json({ error: "Each condition needs attribute, operator, and value" });
                    }
                    if (!VALID_OPERATORS.includes(cond.operator)) {
                        return res.status(400).json({ error: `Invalid operator: ${cond.operator}` });
                    }
                }
            }
        }



        const role = await Role.create({
            _id: roleId,
            name: name.trim(),
            description,

            permissionSets: permissionSets ?? [],
            isTemp: isTemp ?? false,
            expiresAt: isTemp ? expiresAt : null,
            abacPolicies: abacPolicies ?? [],
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
