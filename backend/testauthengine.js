const axios = require("axios");
const { execSync } = require("child_process");

const ROLE_ID = "role_super-admin";
// const ROLE_ID = "role_user";
const BASE_URL = "http://localhost:3000";

function generateToken() {
    console.log("\nGenerating JWT token...");
    
    const output = execSync(
        `node services/auz-engine/src/utils/generateDummyToken.js ${ROLE_ID}`
    ).toString();
    
    const tokenLine = output.split("\n").find(line => line.startsWith("Bearer"));
    const token = tokenLine.split(" ")[1];
    
    return token;
}

async function runTests() {
    try {
        const TOKEN = generateToken();

        console.log("\nToken generated successfully\n");

        console.log("---- Testing /auth/authorize ----");

        const authRes = await axios.get(`${BASE_URL}/auth/authorize`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });

        console.log(authRes.data);


        // ---- URL-Based Access Check (NEW) ----
        console.log("\n---- Testing /auth/check-access (URL-based) ----");

        const urlAccessRes = await axios.post(
            `${BASE_URL}/auth/check-access`,
            {
                url: "/api/v1/users/123",
                method: "PUT"
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        console.log(urlAccessRes.data);


        // ---- Legacy permissionKey-Based Access Check (backward compat) ----
        console.log("\n---- Testing /auth/check-access (legacy permissionKey) ----");

        const legacyAccessRes = await axios.post(
            `${BASE_URL}/auth/check-access`,
            {
                permissionKey: "user-service:user:update"
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        console.log(legacyAccessRes.data);


        console.log("\n---- Testing protected route ----");

        const protectedRes = await axios.get(
            `${BASE_URL}/auth/protected/user-update`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        console.log(protectedRes.data);

    } catch (err) {
        if (err.response) {
            console.error("\nERROR:", err.response.status, err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

runTests();