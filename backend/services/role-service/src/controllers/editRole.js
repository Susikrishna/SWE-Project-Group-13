const axios = require("axios");
const Role = require("../models/Role");
const MfeRegistry = require("../models/MfeRegistry");

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:5001";

const editRole = async (req, res) => {
    try {
        const { roleId, name, description, permissions, mfeAccess, isTemp, expiresAt, abacPolicies, permissionSetIds } = req.body;

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

        // ── Hard Restriction: validate permissions and sets against MFE whitelist ─
        const effectiveMfeAccess = mfeAccess !== undefined ? mfeAccess : role.mfeAccess;
        const effectivePermissions = permissions !== undefined ? permissions : role.permissions;
        const effectiveSetIds = permissionSetIds !== undefined ? permissionSetIds : role.permissionSetIds;

        if (effectiveMfeAccess && effectiveMfeAccess.length > 0) {
            const selectedFeatureIds = Array.from(new Set(effectiveMfeAccess.map(key => key.split("::")[0])));
            const registries = await MfeRegistry.find({ feature: { $in: selectedFeatureIds } });

            const whitelist = new Set();
            registries.forEach(reg => {
                if (reg.allowedPermissions) reg.allowedPermissions.forEach(p => whitelist.add(p));
                if (reg.components && Array.isArray(reg.components)) {
                    reg.components.forEach(comp => {
                        if (comp.allowedPermissions) comp.allowedPermissions.forEach(p => whitelist.add(p));
                    });
                }
            });

            // Validate direct permissions
            if (permissions !== undefined) {
                const unauthorized = effectivePermissions.filter(p => !whitelist.has(p));
                if (unauthorized.length > 0) {
                    return res.status(403).json({
                        error: "Hard Restriction Violation",
                        details: `Permissions not authorized by selected MFEs: ${unauthorized.join(", ")}`,
                    });
                }
            }

            // Validate Permission Sets
            if (permissionSetIds !== undefined && effectiveSetIds.length > 0) {
                let setPermissions = [];
                try {
                    const resolveRes = await axios.post(`${REGISTRY_URL}/registry/permission-sets/resolve`, {
                        ids: effectiveSetIds,
                    });
                    setPermissions = resolveRes.data.permissions || [];
                } catch (fetchErr) {
                    return res.status(502).json({
                        error: "Could not validate Permission Sets",
                        details: fetchErr.message,
                    });
                }

                const unauthorizedSetPerms = setPermissions.filter(p => !whitelist.has(p));
                if (unauthorizedSetPerms.length > 0) {
                    return res.status(403).json({
                        error: "Hard Restriction Violation (Permission Set)",
                        details: `Permission Set contains permissions not authorized by selected MFEs: ${unauthorizedSetPerms.join(", ")}`,
                    });
                }
            }
        }

        if (name              !== undefined) role.name              = name;
        if (description       !== undefined) role.description       = description;
        if (permissions       !== undefined) role.permissions       = permissions;
        if (mfeAccess         !== undefined) role.mfeAccess         = mfeAccess;
        if (permissionSetIds  !== undefined) role.permissionSetIds  = permissionSetIds;
        if (isTemp            !== undefined) role.isTemp            = isTemp;
        if (expiresAt         !== undefined) role.expiresAt         = isTemp ? expiresAt : null;
        if (abacPolicies      !== undefined) role.abacPolicies      = abacPolicies;

        await role.save();
        res.status(200).json(role);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { editRole };
