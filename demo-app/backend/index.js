const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/routes');
const proxyRoutes = require('./routes/proxyRoutes');
const demoApiRoutes = require('./routes/demoApiRoutes');

app.use('/user', userRoutes);
app.use('/proxy', proxyRoutes);
app.use('/demo-api', demoApiRoutes);

app.get('/health', (_req, res) => res.json({ status: "ok", service: "demo-backend" }));

mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => console.log("MongoDB connected for Demo Backend"))
    .catch((err) => console.error("DB connection error:", err));

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`Demo backend running on port ${PORT}`);
});