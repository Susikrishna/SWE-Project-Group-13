const ApiRegistry = require("../models/ApiRegistry");

/**
 * parseRequestContext Middleware
 * 
 * Intercepts an incoming HTTP request, looks up the route and method in the 
 * ApiRegistry, and determines the exact permission key required for access.
 * If the route is public, it allows the request to pass unmodified.
 */
const parseRequestContext = async (req, res, next) => {
    try {
        const reqMethod = req.method.toUpperCase();
        const reqPath = req.path; // The URL path being requested (e.g., /api/users/123)

        // 1. Fetch available routes for this HTTP method
        // (In a highly scaled environment, we would cache this in Redis or memory)
        const possibleRoutes = await ApiRegistry.find({ method: reqMethod, isActive: true });

        let matchedRegistryEntry = null;

        // 2. Iterate through routes to find the best match (handling dynamic like :id)
        for (const entry of possibleRoutes) {
            // Normalize the full route, e.g., '/api/v1/users' + '/:id' -> '/api/v1/users/:id'
            const fullRoute = (entry.basePath + (entry.route === '/' ? '' : entry.route))
                .replace(/\/\//g, '/'); // remove any double slashes

            // Convert express-style route parsing to regex to match the incoming reqPath
            // E.g. /api/users/:id becomes ^/api/users/([^/]+)/?$
            const regexPattern = "^" + fullRoute.replace(/:[a-zA-Z0-9_]+/g, "([^/]+)") + "/?$";
            const matcher = new RegExp(regexPattern);

            if (matcher.test(reqPath)) {
                matchedRegistryEntry = entry;
                break;
            }
        }

        // 3. Fail-safe: Block if route is completely unknown to the platform
        if (!matchedRegistryEntry) {
            return res.status(403).json({ 
                error: "Access Denied", 
                detail: "Route not found in API Registry. Unrecognized endpoint." 
            });
        }

        // 4. Public Check: Allow traffic through immediately if marked public (like login)
        if (matchedRegistryEntry.isPublic) {
            req.isPublicRoute = true;
            return next();
        }

        // 5. Build the Key: service:resource:action
        const requiredPermission = `${matchedRegistryEntry.service}:${matchedRegistryEntry.resource}:${matchedRegistryEntry.action}`;
        
        // 6. Pass it on: attach to the req object for the next middleware (RBAC engine)
        req.requiredPermission = requiredPermission;

        return next();

    } catch (error) {
        console.error("Error in parseRequestContext:", error);
        return res.status(500).json({ error: "Internal Server Error parsing request context." });
    }
};

module.exports = parseRequestContext;
