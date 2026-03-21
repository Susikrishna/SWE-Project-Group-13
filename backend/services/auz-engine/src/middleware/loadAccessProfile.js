const Role = require("../models/Role");
const {
    buildRoleSummary,
    extractRoleIdsFromPayload,
    isTempRoleCurrentlyValid,
    mergeAllowedServices,
    validateRoleIds,
} = require("../utils/accessProfile");

/**
 * Reads JWT payload, fetches roles from DB, and attaches a flat
 * accessProfile to the request object for downstream use.
 */
const loadAccessProfile = async (req, res, next) => {
    try {
        const tokenPayload = req.tokenPayload || {};
        const roleIds = extractRoleIdsFromPayload(tokenPayload);

        if (roleIds.length === 0) {
            return res.status(400).json({ error: "Token payload missing roleId" });
        }

        if (!validateRoleIds(roleIds)) {
            return res.status(400).json({ error: "Invalid role IDs in token" });
        }

        // Fetch roles using the string IDs (e.g., 'role_admin')
        const roles = await Role.find({ _id: { $in: roleIds } }).lean();
        
        if (roles.length === 0) {
            return res.status(403).json({ error: "No matching roles found" });
        }

        // Filter out expired temporary roles
        const activeRoles = roles.filter(isTempRoleCurrentlyValid);
        if (activeRoles.length === 0) {
            return res.status(403).json({ error: "All assigned roles are expired" });
        }

        // Generate the massive flat arrays of permissions
        const { mergedPermissions, mergedMfes } = mergeAllowedServices(activeRoles);

        req.accessProfile = {
            userId: tokenPayload.userId,
            roleIds,
            roles: activeRoles,
            roleSummaries: activeRoles.map(buildRoleSummary),
            mergedPermissions, // e.g. ["user-svc:profile:read", "billing-svc:invoice:create"]
            mergedMfes,        // e.g. ["dash-ui", "settings-ui"]
        };

        return next();
    } catch (error) {
        return res.status(500).json({ error: "Failed to resolve access profile", detail: error.message });
    }
};

module.exports = loadAccessProfile;