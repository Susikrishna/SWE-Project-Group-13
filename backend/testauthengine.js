const axios = require("axios");
const { execSync } = require("child_process");

const ROLE_ID = "69b8361ac8ede16e57d59626";
// const ROLE_ID = "69b8365b9c477bcf45d20264";
const BASE_URL = "http://localhost:4000";

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


        console.log("\n---- Testing /auth/check-access ----");

        const accessRes = await axios.post(
            `${BASE_URL}/auth/check-access`,
            {
                serviceId: "6650000000000000000000a2",
                action: "user:update"
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