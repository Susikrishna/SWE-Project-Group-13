const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const roleRoutes = require("./routes/roleRoutes");

const app = express();
app.use(express.json());

app.use("/roles", roleRoutes);

mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("DB error:", err));

app.listen(process.env.PORT, () => {
    console.log(`Role service running on port ${process.env.PORT}`);
});
