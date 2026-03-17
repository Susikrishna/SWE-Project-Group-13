const mongoose = require("mongoose");

// --- 1. API / Microservice Schema ---
const endpointSchema = new mongoose.Schema({
  path: { type: String, required: true, trim: true },
  method: { 
    type: String, 
    required: true, 
    uppercase: true, 
    enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] 
  },
  resource: { type: String, required: true, trim: true, lowercase: true },
  action: { type: String, required: true, trim: true, lowercase: true }
}, { _id: false });

const apiRegistrySchema = new mongoose.Schema({
  serviceName: { type: String, required: true, trim: true },
  serviceIdentifier: { type: String, required: true, unique: true, trim: true, lowercase: true },
  serviceType: { type: String, default: "microservice" },
  baseUrl: { type: String, required: true, trim: true, match: /^https?:\/\/.+/ },
  endpoints: { type: [endpointSchema], default: [] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// --- 2. Microfrontend Schema ---
const mfeRegistrySchema = new mongoose.Schema({
  serviceName: { type: String, required: true, trim: true },
  serviceIdentifier: { type: String, required: true, unique: true, trim: true, lowercase: true },
  serviceType: { type: String, default: "microfrontend" },
  route: { type: String, required: true, trim: true },
  remoteUrl: { type: String, required: true, trim: true, match: /^https?:\/\/.+/ },
  moduleName: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compile models
const ApiRegistry = mongoose.model("ApiRegistry", apiRegistrySchema);
const MfeRegistry = mongoose.model("MfeRegistry", mfeRegistrySchema);

module.exports = { ApiRegistry, MfeRegistry };