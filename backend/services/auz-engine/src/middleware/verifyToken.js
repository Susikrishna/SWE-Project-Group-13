const jwt = require("jsonwebtoken");

/**
 * Extracts and verifies the Bearer JWT from the Authorization header.
 * On success attaches `req.tokenPayload` and continues.
 * On failure returns 401 / 403.
 *
 * Expected token payload shape:
 *   { userId: string, roleId?: string, roleIds?: string[], iat: number, exp: number }
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or malformed Authorization header. Expected: Bearer <token>",
    });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "dummy_secret_change_in_production";

  try {
    const payload = jwt.verify(token, secret);
    req.tokenPayload = payload;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }
    return res.status(403).json({ error: "Invalid token", detail: err.message });
  }
};

module.exports = verifyToken;
