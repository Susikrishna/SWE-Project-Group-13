const { resolvePermissionFromUrl } = require("../utils/resolvePermission");

/**
 * parseRequestContext Middleware
 * 
 * Intercepts an incoming HTTP request, looks up the route and method in the 
 * ApiRegistry, and determines the exact permission key required for access.
 * If the route is public, it allows the request to pass unmodified.
 */
const parseRequestContext = async (req, res, next) => {
    try {
        const result = await resolvePermissionFromUrl(req.path, req.method);

        // Fail-safe: Block if route is completely unknown to the platform
        if (!result.matched) {
            return res.status(403).json({ 
                error: "Access Denied", 
                detail: "Route not found in API Registry. Unrecognized endpoint." 
            });
        }

        // Public Check: Allow traffic through immediately if marked public (like login)
        if (result.isPublic) {
            req.isPublicRoute = true;
            return next();
        }

        // Pass the resolved permission key on for the RBAC engine
        req.requiredPermission = result.permissionKey;

        return next();

    } catch (error) {
        console.error("Error in parseRequestContext:", error);
        return res.status(500).json({ error: "Internal Server Error parsing request context." });
    }
};

module.exports = parseRequestContext;
