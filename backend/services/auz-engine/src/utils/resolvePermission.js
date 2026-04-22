const ApiRegistry = require("../models/ApiRegistry");

/**
 * resolvePermission(url, method)
 *
 * Given a raw URL and HTTP method (sent by another microservice),
 * looks up the ApiRegistry and resolves the required permission string.
 *
 * @param {string} url    - The URL path to resolve (e.g. "/api/v1/users/123")
 * @param {string} method - The HTTP method (e.g. "GET", "POST")
 * @returns {Promise<{ permissionKey: string|null, isPublic: boolean, matched: boolean }>}
 */
async function resolvePermission(url, method) {
    const reqMethod = method.toUpperCase();

    // Strip query string and hash if present — we only care about the path
    const reqPath = url.split("?")[0].split("#")[0];

    // Fetch candidate routes for this HTTP method
    const possibleRoutes = await ApiRegistry.find({ method: reqMethod, isActive: true });

    let matchedEntry = null;

    for (const entry of possibleRoutes) {
        // Normalize the full route: basePath + route
        const fullRoute = (entry.basePath + (entry.route === "/" ? "" : entry.route))
            .replace(/\/\//g, "/"); // collapse double slashes

        // Convert Express-style route params to regex
        // e.g. /api/users/:id  →  ^/api/users/([^/]+)/?$
        const regexPattern = "^" + fullRoute.replace(/:[a-zA-Z0-9_]+/g, "([^/]+)") + "/?$";
        const matcher = new RegExp(regexPattern);

        if (matcher.test(reqPath)) {
            matchedEntry = entry;
            break;
        }
    }

    // No match — unknown route
    if (!matchedEntry) {
        return { permissionKey: null, isPublic: false, matched: false };
    }

    // Public route — no permission needed
    if (matchedEntry.isPublic) {
        return { permissionKey: null, isPublic: true, matched: true };
    }

    // Build the permission key: service:resource:action
    const permissionKey = `${matchedEntry.service}:${matchedEntry.resource}:${matchedEntry.action}`;
    return { permissionKey, isPublic: false, matched: true };
}

module.exports = { resolvePermission };
