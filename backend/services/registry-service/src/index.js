const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const registryRoutes = require("./routes/RegistryRoutes.js");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/registry", registryRoutes);

mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => console.log("MongoDB connected for Registry Service"))
    .catch((err) => console.error("DB error:", err));

app.listen(process.env.PORT, () => {
    console.log(`Registry service running on port ${process.env.PORT}`);
});