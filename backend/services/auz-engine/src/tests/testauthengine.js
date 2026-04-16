require('dotenv').config();
const axios = require("axios");
const { execSync } = require("child_process");
const path = require("path");

const ROLE_ID = process.env.ROLE_ID || "role_super-admin";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function generateToken() {
    console.log("\nGenerating JWT token...");
    
    // Path to generateDummyToken.js relative to this script
    const scriptPath = path.join(__dirname, "..", "utils", "generateDummyToken.js");
    
    const output = execSync(
        `node "${scriptPath}" ${ROLE_ID}`
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
        const TOKEN = generateToken();

        console.log("\nToken generated successfully\n");

        console.log("---- Testing /auth/authorize ----");

        const authRes = await axios.get(`${BASE_URL}/auth/authorize`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });

        console.log(authRes.data);


        console.log("\n---- Testing /auth/check-access ----");

        const accessRes = await axios.post(
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

        console.log(accessRes.data);


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
            console.error("\nERROR:", err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

runTests();