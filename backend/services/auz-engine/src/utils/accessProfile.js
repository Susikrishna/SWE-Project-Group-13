const mongoose = require("mongoose");

function extractRoleIdsFromPayload(tokenPayload = {}) {
    const roleIds = [];

    if (tokenPayload.roleId) {
        roleIds.push(tokenPayload.roleId);
    }

    if (Array.isArray(tokenPayload.roleIds)) {
        roleIds.push(...tokenPayload.roleIds);
    }

    return [...new Set(roleIds.map(String))];
}

function validateRoleIds(roleIds) {
    return roleIds.every((id) => mongoose.Types.ObjectId.isValid(id));
}

function isTempRoleCurrentlyValid(role) {
    if (!role.isTemp) {
        return true;
    }

    const now = new Date();
    const start = role.startDate ? new Date(role.startDate) : null;
    const end = role.endDate ? new Date(role.endDate) : null;

    if (!start || !end) {
        return false;
    }

    return now >= start && now <= end;
}

function buildRoleSummary(role) {
    return {
        id: role._id,
        name: role.name,
        description: role.description || null,
        isTemp: role.isTemp,
        ...(role.isTemp && { validFrom: role.startDate, validUntil: role.endDate }),
    };
}

function mergeAllowedServices(roles) {
    const permissionMap = new Map();

    for (const role of roles) {
        for (const allowed of role.allowedServices || []) {
            const serviceId = String(allowed.serviceId);
            if (!permissionMap.has(serviceId)) {
                permissionMap.set(serviceId, new Set());
            }

            for (const action of allowed.actions || []) {
                permissionMap.get(serviceId).add(String(action).trim().toLowerCase());
            }
        }
    }

    const mergedAllowedServices = [];
    const permissionsByService = {};

    for (const [serviceId, actionSet] of permissionMap.entries()) {
        const actions = [...actionSet];
        mergedAllowedServices.push({ serviceId, actions });
        permissionsByService[serviceId] = actions;
    }

    return { mergedAllowedServices, permissionsByService };
}

function hasPermission(accessProfile, serviceId, action) {
    const normalizedServiceId = String(serviceId);
    const normalizedAction = String(action).trim().toLowerCase();

    const actions = accessProfile.permissionsByService[normalizedServiceId] || [];
    return actions.includes(normalizedAction);
}

module.exports = {
    buildRoleSummary,
    extractRoleIdsFromPayload,
    hasPermission,
    isTempRoleCurrentlyValid,
    mergeAllowedServices,
    validateRoleIds,
};