const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_SECRET || "supersecretkey";

const token = jwt.sign(
    {
        userId: "dummy_user_001",
        roleId: "69b8361ac8ede16e57d59626", 
    },
    secret,
    { expiresIn: "8h" }
);

console.log("Bearer", token);