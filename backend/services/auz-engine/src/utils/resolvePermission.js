const ApiRegistry = require("../models/ApiRegistry");

/**
 * Resolves a permission key from a URL path and HTTP method
 * by looking it up in the ApiRegistry.
 *
 * @param {string} url    - The URL path (e.g., "/api/v1/users/123")
 * @param {string} method - The HTTP method (e.g., "GET", "POST")
 * @returns {Promise<{ permissionKey: string|null, isPublic: boolean, matched: boolean, entry: object|null }>}
 */
async function resolvePermissionFromUrl(url, method) {
    const reqMethod = method.toUpperCase();

    // Fetch active routes for this HTTP method
    const possibleRoutes = await ApiRegistry.find({ method: reqMethod, isActive: true });

    for (const entry of possibleRoutes) {
        // Build the full route pattern, e.g., '/api/v1/users' + '/:id' -> '/api/v1/users/:id'
        const fullRoute = (entry.basePath + (entry.route === "/" ? "" : entry.route))
            .replace(/\/\//g, "/");

        // Convert Express-style params to regex: /api/users/:id -> ^/api/users/([^/]+)/?$
        const regexPattern = "^" + fullRoute.replace(/:[a-zA-Z0-9_]+/g, "([^/]+)") + "/?$";
        const matcher = new RegExp(regexPattern);

        if (matcher.test(url)) {
            if (entry.isPublic) {
                return { permissionKey: null, isPublic: true, matched: true, entry };
            }

            const permissionKey = `${entry.service}:${entry.resource}:${entry.action}`;
            return { permissionKey, isPublic: false, matched: true, entry };
        }
    }

    return { permissionKey: null, isPublic: false, matched: false, entry: null };
}

module.exports = { resolvePermissionFromUrl };
