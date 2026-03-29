
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const userModel = require("../models/User");

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
        await mongoose.connect("mongodb+srv://aryanag2701_db_user:aryan@user-role.ra19zht.mongodb.net/User-Role");
        console.log("Connected to MongoDB");
        await userModel.deleteMany({});
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