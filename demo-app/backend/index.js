const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const routes = require('./routes/routes');
app.use('/user',routes)

mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => console.log("MongoDB connected for User Service"))
    .catch((err) => console.error("DB connection error:", err));

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);
});