const mongoose = require("mongoose");
const Role = require("../models/Role");
const {
    buildRoleSummary,
    extractRoleIdsFromPayload,
    isTempRoleCurrentlyValid,
    mergeAllowedServices,
    validateRoleIds,
} = require("../utils/accessProfile");

const loadAccessProfile = async (req, res, next) => {
    try {
        const tokenPayload = req.tokenPayload || {};
        const roleIds = extractRoleIdsFromPayload(tokenPayload);

        if (roleIds.length === 0) {
            return res.status(400).json({
                error: "Token payload must include roleId or roleIds",
            });
        }

        if (!validateRoleIds(roleIds)) {
            return res.status(400).json({
                error: "Token payload contains invalid roleId/roleIds",
            });
        }

        const objectRoleIds = roleIds.map(
            (id) => new mongoose.Types.ObjectId(id)
        );

        const roles = await Role.find({ _id: { $in: objectRoleIds } }).lean(); 
        if (roles.length === 0) {
            return res.status(403).json({ error: "No roles found for the current token" });
        }

        const activeRoles = roles.filter(isTempRoleCurrentlyValid);
        if (activeRoles.length === 0) {
            return res.status(403).json({
                error: "All assigned roles are inactive or outside valid time window",
            });
        }

        const { mergedAllowedServices, permissionsByService } = mergeAllowedServices(activeRoles);

        req.accessProfile = {
            userId: tokenPayload.userId,
            roleIds,
            roles: activeRoles,
            roleSummaries: activeRoles.map(buildRoleSummary),
            mergedAllowedServices,
            permissionsByService,
        };

        return next();
    } catch (error) {
        return res.status(500).json({
            error: "Failed to resolve access profile",
            detail: error.message,
        });
    }
};

module.exports = loadAccessProfile;