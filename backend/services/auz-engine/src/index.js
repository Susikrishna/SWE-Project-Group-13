require('dotenv').config({ path: '../../../.env' });
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Register Models so they are available to Mongoose
require("./models/mfeRegistry.model");
require("./models/Role");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth-engine" }));

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(` [auth-engine] Running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to connect DB:", err);
    process.exit(1);
  }
}

startServer();