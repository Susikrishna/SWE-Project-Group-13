const axios = require("axios");
const { execSync } = require("child_process");
const mongoose = require("mongoose");
const Log = require("../../models/LogModel")
require('dotenv').config()

const BASE_URL = `http://localhost:${process.env.PORT}`;
const MONGO_URI = process.env.MONGO_DB_URI;

const ROLES = {
    admin: "role_super-admin",
    user: "role_user",
};

function generateToken(roleId) {
    console.log("\nGenerating JWT token...");
    const output = execSync(
        `node ../../utils/generateDummyToken.js ${roleId}`
    ).toString();
    const tokenLine = output.split("\n").find((l) => l.startsWith("Bearer"));
    const token = tokenLine.split(" ")[1];
    
    return token;
}
async function getRecentLogs(action, limit = 1) {
    return Log.find({ action }).sort({ timestamp: -1 }).limit(limit).lean();
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function testBulkAuthorize(token) {
    console.log("TEST 1 — GET /auth/authorize  →  decision: BULK");
    try {
        const res = await axios.get(`${BASE_URL}/auth/authorize`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        console.log("  Response:", res.status, JSON.stringify(res.data).slice(0, 120));

        await wait(300);
        const [log] = await getRecentLogs("authorize");
        if (!log) return console.log("No log entry found in DB");

        log.decision === "BULK" ? console.log("decision = BULK") : console.log(`decision = ${log.decision}`);
        log.userId ? console.log(`userId saved: ${log.userId}`) : console.log("userId missing");
        log.roleId ? console.log(`roleId saved: ${log.roleId}`) : console.log("roleId missing");
        log.statusCode === 200 ? console.log("statusCode = 200") : console.log(`statusCode = ${log.statusCode}`);
        !log.reason ? console.log("reason is null (no error)") : console.log(`unexpected reason: ${log.reason}`);
    } catch (err) {
        console.log(err.response?.data ? JSON.stringify(err.response.data) : err.message);
    }
}

async function testAllowCheckAccess(token) {
    console.log("TEST 2 — POST /auth/check-access (valid permission)  →  decision: ALLOW");
    try {
        const res = await axios.post(
            `${BASE_URL}/auth/check-access`,
            { permissionKey: "user-service:user:update" },
            { headers: {
                Authorization: `Bearer ${token}`
            }}
        );
        console.log("  Response:", res.status, JSON.stringify(res.data).slice(0, 120));

        await wait(300);
        const [log] = await getRecentLogs("check-access");
        if (!log) return console.log("No log entry found in DB");

        log.decision === "ALLOW" ? console.log("decision = ALLOW") : console.log(`decision = ${log.decision}`);
        log.permission === "user-service:user:update"
            ? console.log(`permission saved: ${log.permission}`)
            : console.log(`permission = ${log.permission}`);
        log.statusCode >= 200 && log.statusCode < 300
            ? console.log(`statusCode = ${log.statusCode}`)
            : console.log(`statusCode = ${log.statusCode}`);
    } catch (err) {
        console.log(err.response?.data ? JSON.stringify(err.response.data) : err.message);
    }
}

async function testDenyCheckAccess(userToken) {
    console.log("TEST 3 — POST /auth/check-access (denied permission)  →  decision: DENY");
    try {
        const res = await axios.post(
            `${BASE_URL}/auth/check-access`,
            { permissionKey: "admin-service:settings:delete" },
            {
                headers: {
                    Authorization: `Bearer ${userToken}`
                } }
        );
        console.log("  Response:", res.status, JSON.stringify(res.data).slice(0, 120));
    } catch (err) {
        console.log(
            "  Response:",
            err.response?.status,
            JSON.stringify(err.response?.data).slice(0, 120)
        );
    }

    await wait(300);
    const [log] = await getRecentLogs("check-access");
    if (!log) return console.log("No log entry found in DB");

    log.decision === "DENY" ? console.log("decision = DENY") : console.log(`decision = ${log.decision}`);
    log.statusCode >= 400
        ? console.log(`statusCode = ${log.statusCode} (error range)`)
        : console.log(`statusCode = ${log.statusCode} (expected 4xx)`);
}

async function testAllowProtectedRoute(token) {
    console.log("TEST 4 — GET /auth/protected/user-update (admin)  →  decision: ALLOW");
    try {
        const res = await axios.get(`${BASE_URL}/auth/protected/user-update`, {
            headers: {
                
                Authorization: `Bearer ${token}`
            
            },
        });
        console.log("  Response:", res.status, JSON.stringify(res.data).slice(0, 120));

        await wait(300);
        const [log] = await getRecentLogs("protected-route");
        if (!log) return console.log("No log entry found in DB");

        log.decision === "ALLOW" ? console.log("decision = ALLOW") : console.log(`decision = ${log.decision}`);
        log.statusCode === 200 ? console.log("statusCode = 200") : console.log(`statusCode = ${log.statusCode}`);
    } catch (err) {
        console.log(err.response?.data ? JSON.stringify(err.response.data) : err.message);
    }
}

async function testDenyProtectedRoute(userToken) {
    console.log("TEST 5 — GET /auth/protected/user-update (low-priv user)  →  decision: DENY");
    try {
        const res = await axios.get(`${BASE_URL}/auth/protected/user-update`, {
            headers: authHeader(userToken),
        });
        console.log("  Response (unexpected 2xx):", res.status, JSON.stringify(res.data).slice(0, 120));
    } catch (err) {
        console.log(
            "  Response:",
            err.response?.status,
            JSON.stringify(err.response?.data).slice(0, 120)
        );
    }
    
    await wait(300);
    const [log] = await getRecentLogs("protected-route");
    if (!log) return console.log("No log entry found in DB");
    
    log.decision === "DENY" ? console.log("decision = DENY") : console.log(`decision = ${log.decision}`);
    log.statusCode >= 400
        ? console.log(`statusCode = ${log.statusCode} (error range)`)
        : console.log(`statusCode = ${log.statusCode}`);
    log.reason ? console.log(`reason captured: "${log.reason}"`) : console.log("reason not captured");
}


async function runTests() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB\n");

    console.log("Generating tokens…");
    const adminToken = generateToken(ROLES.admin);
    const userToken = generateToken(ROLES.user);
    console.log("Tokens ready");

    await testBulkAuthorize(adminToken);
    await testAllowCheckAccess(adminToken);
    await testDenyCheckAccess(userToken);
    await testAllowProtectedRoute(adminToken);
    await testDenyProtectedRoute(userToken);

    console.log("\nAll tests complete\n");
    await mongoose.disconnect();
}

runTests().catch((err) => {
    console.error("Fatal:", err.message);
    process.exit(1);
});