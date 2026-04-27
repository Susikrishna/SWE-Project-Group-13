const axios = require("axios");
const Role = require("../models/Role");
const MfeRegistry = require("../models/MfeRegistry");

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:5001";

const createRole = async (req, res) => {
    try {
        const { name, description, permissions, mfeAccess, isTemp, expiresAt, abacPolicies, permissionSetIds } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Role name is required" });
        }

        const roleId = `role_${name.trim().toLowerCase().replace(/\s+/g, "_")}`;

        const prev = await Role.findById(roleId);
        if (prev) {
            return res.status(409).json({ error: `Role "${name}" already exists` });
        }

        if (permissions && !Array.isArray(permissions)) {
            return res.status(400).json({ error: "permissions must be an array of strings" });
        }
        if (mfeAccess && !Array.isArray(mfeAccess)) {
            return res.status(400).json({ error: "mfeAccess must be an array of strings" });
        }
        if (permissionSetIds && !Array.isArray(permissionSetIds)) {
            return res.status(400).json({ error: "permissionSetIds must be an array of strings" });
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

        // ── Hard Restriction: build MFE whitelist ──────────────────────────
        let whitelist = new Set();
        if (mfeAccess && mfeAccess.length > 0) {
            const selectedFeatureIds = Array.from(new Set(mfeAccess.map(key => key.split("::")[0])));
            const registries = await MfeRegistry.find({ feature: { $in: selectedFeatureIds } });

            registries.forEach(reg => {
                if (reg.allowedPermissions) reg.allowedPermissions.forEach(p => whitelist.add(p));
                if (reg.components && Array.isArray(reg.components)) {
                    reg.components.forEach(comp => {
                        if (comp.allowedPermissions) comp.allowedPermissions.forEach(p => whitelist.add(p));
                    });
                }
            });

            // Validate direct permissions against whitelist
            const unauthorizedDirect = (permissions || []).filter(p => !whitelist.has(p));
            if (unauthorizedDirect.length > 0) {
                return res.status(403).json({
                    error: "Hard Restriction Violation",
                    details: `Permissions not authorized by selected MFEs: ${unauthorizedDirect.join(", ")}`,
                });
            }

            // ── Validate Permission Sets against whitelist ─────────────────
            if (permissionSetIds && permissionSetIds.length > 0) {
                let setPermissions = [];
                try {
                    const resolveRes = await axios.post(`${REGISTRY_URL}/registry/permission-sets/resolve`, {
                        ids: permissionSetIds,
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
        } else if ((permissions && permissions.length > 0) || (permissionSetIds && permissionSetIds.length > 0)) {
            return res.status(403).json({
                error: "Hard Restriction Violation",
                details: "Permissions or Permission Sets cannot be assigned without at least one associated MFE.",
            });
        }

        const role = await Role.create({
            _id: roleId,
            name: name.trim(),
            description,
            permissions: permissions ?? [],
            mfeAccess: mfeAccess ?? [],
            permissionSetIds: permissionSetIds ?? [],
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
