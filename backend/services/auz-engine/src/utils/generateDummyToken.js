/**
 * generateDummyToken.js
 * ─────────────────────
 * DEV-ONLY utility — generates a signed JWT that the auth-engine will accept.
 *
 * Usage:
 *   node src/utils/generateDummyToken.js <roleIdOrCommaSeparatedRoleIds>
 *
 * Example:
 *   node src/utils/generateDummyToken.js 6641c8f0e13a4b2d9c7f1234
 *   node src/utils/generateDummyToken.js 6641c8f0e13a4b2d9c7f1234,6652d9f1f24b5c3ea8ab5678
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const jwt = require("jsonwebtoken");

const roleInput = process.argv[2];

if (!roleInput) {
  console.error("Usage: node generateDummyToken.js <roleIdOrCommaSeparatedRoleIds>");
  process.exit(1);
}

const roleIds = roleInput
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const secret = process.env.JWT_SECRET || "dummy_secret_change_in_production";

const payload = {
  userId: "dummy_user_001",
  roleId: roleIds[0],
  ...(roleIds.length > 1 ? { roleIds } : {}),
};

const token = jwt.sign(payload, secret, { expiresIn: "8h" });

console.log("\n✅  Dummy JWT generated (valid 8 h):\n");
console.log(`Bearer ${token}`);
console.log("\nDecoded payload:", jwt.decode(token), "\n");
