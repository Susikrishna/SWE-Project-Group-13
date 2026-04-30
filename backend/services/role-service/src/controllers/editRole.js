const Role = require("../models/Role");

const editRole = async (req, res) => {
    try {
        const { roleId, name, description, permissionSets, isTemp, expiresAt, abacPolicies } = req.body;

        if (!roleId) return res.status(400).json({ error: "roleId is required" });

        const role = await Role.findById(roleId);
        if (!role) return res.status(404).json({ error: "Role not found" });

        // ── Validate abacPolicies ──────────────────────────────────────────
        const VALID_OPERATORS = ["eq", "neq", "in", "nin", "gte_clearance"];
        if (abacPolicies) {
            if (!Array.isArray(abacPolicies)) {
                return res.status(400).json({ error: "abacPolicies must be an array" });
            }
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

        if (name        !== undefined) role.name        = name;
        if (description !== undefined) role.description = description;

        if (permissionSets !== undefined) role.permissionSets = permissionSets;
        if (isTemp      !== undefined) role.isTemp      = isTemp;
        if (expiresAt   !== undefined) role.expiresAt   = isTemp ? expiresAt : null;
        if (abacPolicies!== undefined) role.abacPolicies= abacPolicies;

        await role.save();
        res.status(200).json(role);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { editRole };
