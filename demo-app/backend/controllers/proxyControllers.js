const axios = require("axios");
const userModel = require("../models/User");

const AUZ_ENGINE_URL = process.env.AUZ_ENGINE_URL || "http://localhost:3000";

/**
 * GET /user/me
 * Returns the current user's profile from the JWT.
 */
const getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /proxy/authorize
 * Forwards the user's JWT to the auz-engine's /auth/authorize endpoint.
 * Returns the full authorization profile (permissions + microfrontends).
 */
const proxyAuthorize = async (req, res) => {
    try {
        const response = await axios.get(`${AUZ_ENGINE_URL}/auth/authorize`, {
            headers: {
                Authorization: `Bearer ${req.token}`,
            },
        });
        res.status(200).json(response.data);
    } catch (err) {
        const status = err.response?.status || 500;
        const data = err.response?.data || { error: "Failed to reach AUZ Engine" };
        res.status(status).json(data);
    }
};

/**
 * POST /proxy/check-access
 * Forwards { url, method } to the auz-engine's /auth/check-access endpoint.
 * Returns the real-time authorization decision.
 */
const proxyCheckAccess = async (req, res) => {
    try {
        const { url, method } = req.body;

        if (!url || !method) {
            return res.status(400).json({ error: "Both 'url' and 'method' are required" });
        }

        const response = await axios.post(
            `${AUZ_ENGINE_URL}/auth/check-access`,
            { url, method },
            {
                headers: {
                    Authorization: `Bearer ${req.token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(200).json(response.data);
    } catch (err) {
        const status = err.response?.status || 500;
        const data = err.response?.data || { error: "Failed to reach AUZ Engine" };
        res.status(status).json(data);
    }
};

module.exports = { getMe, proxyAuthorize, proxyCheckAccess };
