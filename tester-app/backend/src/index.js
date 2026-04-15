require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Load models
require('./models/Gradelist');
require('./models/FeePayment');
require('./models/RoomBooking');

const gradelistRoutes = require("./routes/gradelistRoutes");
const feeRoutes = require("./routes/feeRoutes");
const roomRoutes = require("./routes/roomRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/gradelist", gradelistRoutes);
app.use("/api/fee-status", feeRoutes);
app.use("/api/room-booking", roomRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "tester-app" }));

mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => console.log("MongoDB connected for Tester App"))
    .catch((err) => console.error("DB connection error:", err));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Tester App backend running on port ${PORT}`);
});
