const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const userModel = require("../models/User");

dotenv.config();

const dummyUsers = [
    { name: "Alice Johnson", username: "alice_j" },
    { name: "Bob Smith", username: "bob_s" },
    { name: "Carol White", username: "carol_w" },
    { name: "David Brown", username: "david_b" },
    { name: "Eva Martinez", username: "eva_m" },
    { name: "Frank Lee", username: "frank_l" },
    { name: "Grace Kim", username: "grace_k" },
    { name: "Henry Wilson", username: "henry_w" },
    { name: "Isla Thompson", username: "isla_t" },
    { name: "Jack Davis", username: "jack_d" },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log("Connected to MongoDB");

        const hashedPassword = await bcrypt.hash("password123", 10);

        const users = dummyUsers.map((u) => ({
            ...u,
            password: hashedPassword,
            roles: [],
        }));

        await userModel.insertMany(users);
        console.log("10 dummy users created successfully");

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

seed();