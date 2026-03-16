require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");


// Register models (order matters — Role references ServiceRegistry)
require("./models/RegistryModel");
require("./models/Role");
const connectDB = require("./config/db")

connectDB()
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth-engine" }));

// ── DB ────────────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => console.log("[auth-engine] MongoDB connected"))
  .catch((err) => console.error("[auth-engine] DB error:", err));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[auth-engine] Running on port ${PORT}`));
