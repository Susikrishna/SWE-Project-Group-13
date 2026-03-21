const { hasPermission } = require("../utils/accessProfile");

/**
 * Protects an endpoint by requiring a specific permission string.
 * @param {string} permissionKey - e.g. 'user-svc:profile:update'
 */
const requirePermission = (permissionKey) => {
    return (req, res, next) => {
        if (!req.accessProfile) {
            return res.status(500).json({
                error: "System error: Access profile not loaded.",
            });
        }

        const allowed = hasPermission(req.accessProfile, permissionKey);
        
        if (!allowed) {
            return res.status(403).json({
                error: "Forbidden: You lack the required permissions.",
                required: permissionKey,
            });
        }

        return next();
    };
};

module.exports = requirePermission;