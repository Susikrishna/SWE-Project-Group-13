/**
 * Seeds the ApiRegistry with sample entries for testing URL-based permission resolution.
 * 
 * Usage: node services/auz-engine/src/tests/seedApiRegistry.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const ApiRegistry = require("../models/ApiRegistry");

const sampleEntries = [
    {
        service: "user-service",
        basePath: "/api/v1/users",
        route: "/:id",
        method: "PUT",
        description: "Update a user by ID",
        resource: "user",
        action: "update",
        permissionKey: "user-service:user:update",
        isPublic: false,
        isActive: true,
    },
    {
        service: "user-service",
        basePath: "/api/v1/users",
        route: "/",
        method: "GET",
        description: "List all users",
        resource: "user",
        action: "read",
        permissionKey: "user-service:user:read",
        isPublic: false,
        isActive: true,
    },
    {
        service: "user-service",
        basePath: "/api/v1/users",
        route: "/:id",
        method: "GET",
        description: "Get a single user by ID",
        resource: "user",
        action: "read",
        permissionKey: "user-service:user:read",
        isPublic: false,
        isActive: true,
    },
    {
        service: "auth-service",
        basePath: "/api/v1/auth",
        route: "/login",
        method: "POST",
        description: "User login (public)",
        resource: "auth",
        action: "login",
        permissionKey: "auth-service:auth:login",
        isPublic: true,
        isActive: true,
    },
];

async function seed() {
    try {
        await connectDB();
        console.log("Connected to DB.\n");

        for (const entry of sampleEntries) {
            const filter = {
                service: entry.service,
                basePath: entry.basePath,
                route: entry.route,
                method: entry.method,
            };
            await ApiRegistry.findOneAndUpdate(filter, entry, { upsert: true, new: true });
            console.log(`  ✓ ${entry.method} ${entry.basePath}${entry.route === "/" ? "" : entry.route} → ${entry.permissionKey}`);
        }

        console.log("\nSeeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
