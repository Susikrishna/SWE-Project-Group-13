const jwt = require("jsonwebtoken");

/**
 * Simple JWT verification middleware for the demo backend.
 * Extracts userId and roleId from the token payload.
 */
const verifyAuth = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or malformed Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "dummy_secret_change_in_production";

    try {
        const payload = jwt.verify(token, secret);
        req.userId = payload.userId;
        req.roleId = payload.roleId;
        req.token = token;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        return res.status(403).json({ error: "Invalid token", detail: err.message });
    }
};

module.exports = verifyAuth;
