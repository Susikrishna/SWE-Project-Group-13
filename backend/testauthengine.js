const axios = require("axios");

// paste your generated token here
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkdW1teV91c2VyXzAwMSIsInJvbGVJZCI6IjY5YjgzNjFhYzhlZGUxNmU1N2Q1OTYyNiIsImlhdCI6MTc3MzY4MTA5OSwiZXhwIjoxNzczNzA5ODk5fQ.Jk7lvFH9B6Kg3vgfrp_65x2R23LuswcV-EGFnXQk7Gs";

const BASE_URL = "http://localhost:4000";

async function runTests() {
    try {
        console.log("\n---- Testing /auth/authorize ----");

        const authRes = await axios.get(`${BASE_URL}/auth/authorize`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });

        console.log(authRes.data);


        console.log("\n---- Testing /auth/check-access ----");

        const accessRes = await axios.post(
            `${BASE_URL}/auth/check-access`,
            {
                serviceId: "6650000000000000000000a6",
                action: "dashboard:view"
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