const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const routes = require('./routes/UserRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/user', routes);

mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => console.log("MongoDB connected for User Service"))
    .catch((err) => console.error("DB connection error:", err));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);
});