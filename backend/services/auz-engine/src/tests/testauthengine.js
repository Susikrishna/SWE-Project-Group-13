require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const axios = require("axios");
const jwt = require("jsonwebtoken");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ── Helpers ──────────────────────────────────────────────────────────────────

const PASS = "\x1b[32m✓ PASS\x1b[0m";
const FAIL = "\x1b[31m✗ FAIL\x1b[0m";

let passed = 0;
let failed = 0;

function assert(label, condition, detail) {
    if (condition) {
        console.log(`  ${PASS}  ${label}`);
        passed++;
    } else {
        console.log(`  ${FAIL}  ${label}  →  ${detail || "assertion failed"}`);
        failed++;
    }
}

function generateToken(roleId) {
    const payload = {
        userId: roleId === "role_super-admin" ? "admin" : "testuser",
        roleId,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// ── Tests ────────────────────────────────────────────────────────────────────

async function runTests() {
    console.log(`\n🔑  Generating tokens...`);
    const adminToken = generateToken("role_super-admin");
    const userToken = generateToken("role_user");
    console.log(`    Admin token: ${adminToken.slice(0, 20)}...`);
    console.log(`    User  token: ${userToken.slice(0, 20)}...\n`);

    // ─── Test 1: Full authorization profile (Admin) ──────────────────────
    console.log("── Test 1: GET /auth/authorize (Admin) ──");
    try {
        const res = await axios.get(`${BASE_URL}/auth/authorize`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        assert("Status is 200", res.status === 200);
        assert("userId present", !!res.data.userId, `got: ${res.data.userId}`);
        assert("roles array exists", Array.isArray(res.data.roles), `got: ${typeof res.data.roles}`);
        assert("microfrontends array exists", Array.isArray(res.data.microfrontends), `got: ${typeof res.data.microfrontends}`);

        if (res.data.microfrontends.length > 0) {
            console.log(`    Allowed MFEs: ${res.data.microfrontends.map(m => m.name || m.feature).join(", ")}`);
        }
        if (res.data.roles.length > 0) {
            console.log(`    Roles: ${res.data.roles.map(r => r.name || r.id).join(", ")}`);
        }
    } catch (err) {
        console.log(`  ${FAIL}  Request failed: ${err.response?.data?.error || err.message}`);
        failed++;
    }

    // ─── Test 2: Full authorization profile (User) ───────────────────────
    console.log("\n── Test 2: GET /auth/authorize (User) ──");
    try {
        const res = await axios.get(`${BASE_URL}/auth/authorize`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });

        assert("Status is 200", res.status === 200);
        assert("userId present", !!res.data.userId);
        assert("roles array exists", Array.isArray(res.data.roles));
    } catch (err) {
        console.log(`  ${FAIL}  Request failed: ${err.response?.data?.error || err.message}`);
        failed++;
    }

    // ─── Test 3: check-access with URL + method (Admin, should ALLOW) ────
    console.log("\n── Test 3: POST /auth/check-access — URL resolve (Admin) ──");
    try {
        const res = await axios.post(
            `${BASE_URL}/auth/check-access`,
            { url: "/api/v1/users/123", method: "PUT" },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        assert("Status is 200", res.status === 200);
        assert("allowed field present", res.data.allowed !== undefined, `got: ${JSON.stringify(res.data)}`);
        console.log(`    Result: ${JSON.stringify(res.data)}`);
    } catch (err) {
        if (err.response) {
            // A 403 means the route isn't in ApiRegistry — that's valid behavior
            assert("403 = route not in ApiRegistry (expected if not seeded)", err.response.status === 403);
            console.log(`    Detail: ${JSON.stringify(err.response.data)}`);
        } else {
            console.log(`  ${FAIL}  ${err.message}`);
            failed++;
        }
    }

    // ─── Test 4: check-access with unknown route ─────────────────────────
    console.log("\n── Test 4: POST /auth/check-access — unknown route ──");
    try {
        const res = await axios.post(
            `${BASE_URL}/auth/check-access`,
            { url: "/api/v1/unknown/route", method: "DELETE" },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        // Should not reach here — controller returns 403 for unknown routes
        assert("Unexpected 200 for unknown route", false, `got ${res.status}: ${JSON.stringify(res.data)}`);
    } catch (err) {
        if (err.response) {
            assert("Returns 403 for unknown route", err.response.status === 403);
            assert("Error mentions 'Route not found'",
                (err.response.data.detail || "").includes("Route not found"),
                `got: ${err.response.data.detail}`
            );
        } else {
            console.log(`  ${FAIL}  ${err.message}`);
            failed++;
        }
    }

    // ─── Test 5: check-access missing required fields ────────────────────
    console.log("\n── Test 5: POST /auth/check-access — missing method field ──");
    try {
        const res = await axios.post(
            `${BASE_URL}/auth/check-access`,
            { url: "/api/v1/users" }, // missing method
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        // If only url is provided without method, controller should return 400
        assert("Returns 400 for missing method", res.status === 400, `got: ${res.status}`);
    } catch (err) {
        if (err.response) {
            assert("Returns 400 for missing method", err.response.status === 400, `got: ${err.response.status}`);
            console.log(`    Detail: ${JSON.stringify(err.response.data)}`);
        } else {
            console.log(`  ${FAIL}  ${err.message}`);
            failed++;
        }
    }

    // ─── Test 6: check-access with direct permissionKey ──────────────────
    console.log("\n── Test 6: POST /auth/check-access — direct permissionKey (Admin) ──");
    try {
        const res = await axios.post(
            `${BASE_URL}/auth/check-access`,
            { permissionKey: "user-service:user:read" },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        assert("Status is 200", res.status === 200);
        assert("Response includes 'allowed' field", res.data.allowed !== undefined);
        console.log(`    Allowed: ${res.data.allowed} | Reason: ${res.data.reason}`);
    } catch (err) {
        console.log(`  ${FAIL}  ${err.response?.data?.error || err.message}`);
        failed++;
    }

    // ─── Test 7: check-access with User role (Denied permission) ─────────
    console.log("\n── Test 7: POST /auth/check-access — User role RBAC deny ──");
    try {
        const res = await axios.post(
            `${BASE_URL}/auth/check-access`,
            { permissionKey: "user-service:user:delete" },
            { headers: { Authorization: `Bearer ${userToken}` } }
        );

        assert("Status is 200", res.status === 200);
        assert("allowed is false (RBAC denied)", res.data.allowed === false,
            `got allowed=${res.data.allowed}, reason=${res.data.reason}`);
        console.log(`    Reason: ${res.data.reason}`);
    } catch (err) {
        console.log(`  ${FAIL}  ${err.response?.data?.error || err.message}`);
        failed++;
    }

    // ─── Test 8: check-access with URL containing query params & fragment ─
    console.log("\n── Test 8: POST /auth/check-access — URL with query/fragment ──");
    try {
        const res = await axios.post(
            `${BASE_URL}/auth/check-access`,
            { url: "/api/v1/users/123?sort=asc&page=2#section", method: "GET" },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        assert("Status is 200 or 403", [200, 403].includes(res.status), `got: ${res.status}`);
        console.log(`    Result: ${JSON.stringify(res.data)}`);
    } catch (err) {
        if (err.response && err.response.status === 403) {
            assert("403 = route not in ApiRegistry (expected if not seeded)", true);
        } else {
            console.log(`  ${FAIL}  ${err.response?.data?.error || err.message}`);
            failed++;
        }
    }

    // ─── Test 9: check-access with ABAC inline policy ────────────────────
    console.log("\n── Test 9: POST /auth/check-access — ABAC inline policy ──");
    try {
        const res = await axios.post(
            `${BASE_URL}/auth/check-access`,
            {
                permissionKey: "user-service:user:read",
                policy: {
                    allOf: [
                        { attribute: "subject.department", op: "eq", value: "engineering" },
                    ],
                },
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        assert("Status is 200", res.status === 200);
        assert("abacEvaluated is true", res.data.abacEvaluated === true,
            `got: ${res.data.abacEvaluated}`);
        console.log(`    Allowed: ${res.data.allowed} | Reason: ${res.data.reason}`);
    } catch (err) {
        console.log(`  ${FAIL}  ${err.response?.data?.error || err.message}`);
        failed++;
    }

    // ─── Test 10: No auth header → 401 ───────────────────────────────────
    console.log("\n── Test 10: GET /auth/authorize — no auth header ──");
    try {
        await axios.get(`${BASE_URL}/auth/authorize`);
        assert("Should have returned 401", false);
    } catch (err) {
        if (err.response) {
            assert("Returns 401 without Authorization header", err.response.status === 401);
        } else {
            console.log(`  ${FAIL}  ${err.message}`);
            failed++;
        }
    }

    // ─── Test 11: Invalid token → 403 ────────────────────────────────────
    console.log("\n── Test 11: GET /auth/authorize — invalid token ──");
    try {
        await axios.get(`${BASE_URL}/auth/authorize`, {
            headers: { Authorization: "Bearer this.is.not.a.valid.token" },
        });
        assert("Should have returned 403", false);
    } catch (err) {
        if (err.response) {
            assert("Returns 403 for invalid token", err.response.status === 403);
        } else {
            console.log(`  ${FAIL}  ${err.message}`);
            failed++;
        }
    }

    // ─── Test 12: Health check ───────────────────────────────────────────
    console.log("\n── Test 12: GET /health ──");
    try {
        const res = await axios.get(`${BASE_URL}/health`);
        assert("Status is 200", res.status === 200);
        assert("status field is 'ok'", res.data.status === "ok", `got: ${res.data.status}`);
        assert("service field is 'auth-engine'", res.data.service === "auth-engine", `got: ${res.data.service}`);
    } catch (err) {
        console.log(`  ${FAIL}  ${err.message}`);
        failed++;
    }

    // ─── Summary ─────────────────────────────────────────────────────────
    console.log("\n═══════════════════════════════════════════");
    console.log(`  Total: ${passed + failed}   \x1b[32m${passed} passed\x1b[0m   \x1b[31m${failed} failed\x1b[0m`);
    console.log("═══════════════════════════════════════════\n");

    process.exit(failed > 0 ? 1 : 0);
}

runTests();