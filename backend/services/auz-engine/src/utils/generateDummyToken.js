/**
 * generateDummyToken.js
 * ─────────────────────
 * DEV-ONLY utility — generates a signed JWT that the auth-engine will accept.
 *
 * Usage:
 *   node src/utils/generateDummyToken.js <roleId>
 *
 * Example:
 *   node src/utils/generateDummyToken.js 6641c8f0e13a4b2d9c7f1234
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const jwt = require("jsonwebtoken");

const roleId = process.argv[2];

if (!roleId) {
  console.error("Usage: node generateDummyToken.js <roleId>");
  process.exit(1);
}

const secret = process.env.JWT_SECRET || "dummy_secret_change_in_production";

const payload = {
  userId: "dummy_user_001",
  roleId,                // MongoDB ObjectId of the role
};

const token = jwt.sign(payload, secret, { expiresIn: "8h" });

console.log("\n✅  Dummy JWT generated (valid 8 h):\n");
console.log(`Bearer ${token}`);
console.log("\nDecoded payload:", jwt.decode(token), "\n");
