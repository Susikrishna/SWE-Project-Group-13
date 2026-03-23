/**
 * Usage: node src/utils/generateDummyToken.js role_admin
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const jwt = require("jsonwebtoken");

const roleInput = process.argv[2];

if (!roleInput) {
  console.error("Usage: node generateDummyToken.js <role_id>");
  process.exit(1);
}

const roleIds = roleInput.split(",").map(id => id.trim()).filter(Boolean);
const secret = process.env.JWT_SECRET || "dummy_secret_change_in_production";

const payload = {
  userId: "dummy_user_001",
  roleId: roleIds[0],
  ...(roleIds.length > 1 ? { roleIds } : {}),
};

const token = jwt.sign(payload, secret, { expiresIn: "8h" });
console.log(`\nDummy JWT generated:\nBearer ${token}\n`);