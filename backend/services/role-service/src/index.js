require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('./models/Role'); // Load the updated model

const roleRoutes = require("./routes/RoleRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/roles", roleRoutes);

mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => console.log("MongoDB connected for Role Service"))
    .catch((err) => console.error("DB connection error:", err));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Role service running on port ${PORT}`);
});