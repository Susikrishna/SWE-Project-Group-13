/**
 * generate-tokens.js
 * Prints JWT tokens for all 4 tester-app roles.
 * Usage: node generate-tokens.js
 */
require("dotenv").config();
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET || "your_jwt_secret_here";

const roles = [
    { roleId: "role_admin",        label: "Admin (full CRUD on all 3 resources)" },
    { roleId: "role_acad-section", label: "Acad-Section (gradelist CRD, room-booking R)" },
    { roleId: "role_student",      label: "Student (gradelist R, fee-status R)" },
    { roleId: "role_admin-office", label: "Admin-Office (fee-status CRUD, room-booking CRUD)" },
];

console.log("\n═══════════════════════════════════════════════════════");
console.log("  Tester App — JWT Tokens (valid for 8 hours)");
console.log("═══════════════════════════════════════════════════════\n");

for (const { roleId, label } of roles) {
    const token = jwt.sign(
        { userId: `user_${roleId.replace("role_", "")}`, roleId },
        secret,
        { expiresIn: "8h" }
    );
    console.log(`  ▸ ${label}`);
    console.log(`    ${token}\n`);
}
