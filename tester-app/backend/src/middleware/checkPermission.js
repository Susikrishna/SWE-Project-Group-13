const axios = require("axios");

const AUZ_URL = process.env.AUZ_ENGINE_URL || "http://localhost:3000";

/**
 * Middleware factory that checks a specific permission via the auz-engine.
 * Same pattern as the existing requirePermission middleware but calls
 * the auz-engine's POST /auth/check-access endpoint remotely.
 */
const checkPermission = (permissionKey) => async (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ error: "Missing Authorization header" });
    }

    try {
        const { data } = await axios.post(
            `${AUZ_URL}/auth/check-access`,
            { permissionKey },
            { headers: { Authorization: authHeader } }
        );

        if (!data.allowed) {
            return res.status(403).json({ error: "Forbidden", requiredPermission: permissionKey });
        }

        req.userId = data.userId;
        next();
    } catch (err) {
        const status = err.response?.status || 500;
        const message = err.response?.data?.error || "Auth check failed";
        return res.status(status).json({ error: message });
    }
};

module.exports = checkPermission;
