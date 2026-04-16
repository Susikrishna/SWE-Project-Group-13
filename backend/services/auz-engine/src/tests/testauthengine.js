require('dotenv').config();
const axios = require("axios");
const { execSync } = require("child_process");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function generateToken(roleId) {
    console.log(`\nGenerating JWT token for ${roleId}...`);
    
    // Path to generateDummyToken.js relative to this script
    const scriptPath = path.join(__dirname, "..", "utils", "generateDummyToken.js");
    
    const output = execSync(
        `node "${scriptPath}" ${roleId}`
    ).toString();
    
    const tokenLine = output.split("\n").find(line => line.startsWith("Bearer"));
    if (!tokenLine) {
        throw new Error("Could not find token in output: " + output);
    }
    const token = tokenLine.split(" ")[1];
    
    return token;
}

async function runTests() {
    try {
        const adminToken = generateToken("role_super-admin");
        const userToken = generateToken("role_user");

        console.log("\nTokens generated successfully\n");

        // ─── Test 1: Full authorization profile (Admin) ───────────────────
        console.log("---- Testing /auth/authorize (Admin) ----");

        const authRes = await axios.get(`${BASE_URL}/auth/authorize`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log("Allowed microfrontends:", authRes.data.microfrontends.map(m => m.name));
        console.log("Permissions count:", authRes.data.permissions.length);


        // ─── Test 2: check-access with URL + method ──────────────────
        console.log("\n---- Testing /auth/check-access (URL decode, Admin) ----");

        const accessRes = await axios.post(
            `${BASE_URL}/auth/check-access`,
            {
                url: "/api/v1/users/123",
                method: "PUT"
            },
            {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        console.log(accessRes.data);


        // ─── Test 3: check-access with unknown route ─────────────────
        console.log("\n---- Testing /auth/check-access (unknown route) ----");

        try {
            const unknownRes = await axios.post(
                `${BASE_URL}/auth/check-access`,
                {
                    url: "/api/v1/unknown/route",
                    method: "DELETE"
                },
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );
            console.log(unknownRes.data);
        } catch (err) {
            if (err.response) {
                console.log("Expected 403:", err.response.data);
            } else {
                throw err;
            }
        }


        // ─── Test 4: check-access missing fields ─────────────────────
        console.log("\n---- Testing /auth/check-access (missing fields) ----");

        try {
            const missingRes = await axios.post(
                `${BASE_URL}/auth/check-access`,
                { url: "/api/v1/users" },  // missing method
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    }
                }
            );
            console.log(missingRes.data);
        } catch (err) {
            if (err.response) {
                console.log("Expected 400:", err.response.data);
            } else {
                throw err;
            }
        }


        // ─── Test 5: protected route ─────────────────────────────────
        console.log("\n---- Testing protected route (/auth/protected/user-update) ----");

        const protectedRes = await axios.get(
            `${BASE_URL}/auth/protected/user-update`,
            {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        console.log(protectedRes.data);

        // ─── Test 6: check-access with standard user (Allowed) ───────
        console.log("\n---- Testing /auth/check-access with User Role (Allowed) ----");

        const userAllowedRes = await axios.post(
            `${BASE_URL}/auth/check-access`,
            {
                url: "/api/v1/users/123",
                method: "GET" // user role has user-service:user:read
            },
            {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            }
        );

        console.log(userAllowedRes.data);

        // ─── Test 7: check-access with standard user (Denied) ────────
        console.log("\n---- Testing /auth/check-access with User Role (Denied) ----");

        const userDeniedRes = await axios.post(
            `${BASE_URL}/auth/check-access`,
            {
                url: "/api/v1/users",
                method: "POST" // user role DOES NOT have user-service:user:create
            },
            {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            }
        );

        console.log("User Denied Response:", userDeniedRes.data);

        // ─── Test 8: check-access with query strings and fragment ────
        console.log("\n---- Testing /auth/check-access with Query Params/Fragment ----");

        const queryRes = await axios.post(
            `${BASE_URL}/auth/check-access`,
            {
                url: "/api/v1/users/123?sort=asc&page=2#section",
                method: "GET" 
            },
            {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        console.log("Query Response:", queryRes.data);


    } catch (err) {
        if (err.response) {
            console.error("\nERROR:", err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

runTests();