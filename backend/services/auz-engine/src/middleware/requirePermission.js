const { hasPermission } = require("../utils/accessProfile");

const requirePermission = (serviceId, action) => {
    return (req, res, next) => {
        if (!req.accessProfile) {
            return res.status(500).json({
                error: "Access profile not loaded. Ensure loadAccessProfile middleware runs first.",
            });
        }

        const allowed = hasPermission(req.accessProfile, serviceId, action);
        if (!allowed) {
            return res.status(403).json({
                error: "Forbidden",
                required: { serviceId, action },
            });
        }

        return next();
    };
};

module.exports = requirePermission;