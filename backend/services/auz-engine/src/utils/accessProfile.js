/**
 * utils/accessProfile.js
 * Contains pure functions to handle Role parsing and flattening.
 */

function extractRoleIdsFromPayload(tokenPayload = {}) {
    const roleIds = [];
    if (tokenPayload.roleId) roleIds.push(tokenPayload.roleId);
    if (Array.isArray(tokenPayload.roleIds)) roleIds.push(...tokenPayload.roleIds);
    return [...new Set(roleIds.map(String))];
}

function validateRoleIds(roleIds) {
    // Role IDs are now custom strings (e.g., 'role_admin'), not ObjectIds
    return roleIds.every((id) => typeof id === "string" && id.trim() !== "");
}

function isTempRoleCurrentlyValid(role) {
    if (!role.isTemp) return true;
    
    // Check against the flattened schema's single expiresAt date
    if (!role.expiresAt) return false;
    
    return new Date() <= new Date(role.expiresAt);
}

function buildRoleSummary(role) {
    return {
        id: role._id,
        name: role.name,
        description: role.description || null,
        isTemp: role.isTemp,
        ...(role.isTemp && { expiresAt: role.expiresAt }),
    };
}

function mergeAllowedServices(roles) {
    // Use Sets to automatically deduplicate permissions across multiple roles
    const permissionSet = new Set();
    const mfeSet = new Set();

    for (const role of roles) {
        // Flatten API permissions (e.g., "user-svc:profile:read")
        (role.permissions || []).forEach(perm => permissionSet.add(perm.toLowerCase()));
        
        // Flatten UI access slugs (e.g., "set-ui")
        (role.mfeAccess || []).forEach(mfe => mfeSet.add(mfe.toLowerCase()));
    }

    return { 
        mergedPermissions: Array.from(permissionSet), 
        mergedMfes: Array.from(mfeSet) 
    };
}

function hasPermission(accessProfile, permissionKey) {
    // O(1) instant lookup check against the flattened array
    const normalizedKey = String(permissionKey).trim().toLowerCase();
    return accessProfile.mergedPermissions.includes(normalizedKey);
}

module.exports = {
    buildRoleSummary,
    extractRoleIdsFromPayload,
    hasPermission,
    isTempRoleCurrentlyValid,
    mergeAllowedServices,
    validateRoleIds,
};