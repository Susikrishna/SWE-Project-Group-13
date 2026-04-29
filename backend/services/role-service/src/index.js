require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('./models/Role'); // Load the updated model

const roleRoutes = require("./routes/RoleRoutes");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3002;

async function bootstrap() {
    await mongoose.connect(process.env.MONGO_DB_URI, {
        serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected for Role Service");

    app.use("/roles", roleRoutes);

    app.listen(PORT, () => {
        console.log(`Role service running on port ${PORT}`);
    });
}

bootstrap().catch((err) => {
    console.error("Role bootstrap error:", err.message);
    process.exit(1);
});
