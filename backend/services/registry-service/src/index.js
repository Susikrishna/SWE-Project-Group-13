require('dotenv').config();
const express = require("express");
const cors = require("cors"); // REQUIRED for React frontend to talk to this API
const connectDB = require("./config/db.config");

const apiRoutes = require("./routes/apiRegistry.routes");
const mfeRoutes = require("./routes/mfeRegistry.routes");
const permissionSetRoutes = require("./routes/permissionSet.routes");

const app = express();

// --- Middleware ---
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON payloads

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  await connectDB();

  // --- Route Mounting ---
  // Mount API Registry routes.
  // Frontend calls: POST /registry/services/bulk
  app.use("/registry/services", apiRoutes);

  // Mount MFE Registry routes.
  // Frontend calls: POST /registry/mfes
  app.use("/registry/mfes", mfeRoutes);

  // Mount Permission Set routes.
  app.use("/registry/permission-sets", permissionSetRoutes);

  // --- Health Check ---
  app.get("/", (req, res) => {
    res.status(200).json({
      service: "Registry Service",
      status: "Running 🚀",
      timestamp: new Date().toISOString()
    });
  });

  app.listen(PORT, () => {
    console.log(`Registry Service is running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Registry bootstrap error:", err.message);
  process.exit(1);
});
