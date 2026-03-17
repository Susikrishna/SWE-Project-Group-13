const express = require("express");
const router = express.Router();
const { 
    createRegistryEntry, 
    getApiRegistries, 
    getMfeRegistries 
} = require("../controllers/RegistryController");

// This handles POST http://localhost:6970/registry/
router.post("/", createRegistryEntry);

// This handles GET http://localhost:6970/registry/apis
router.get("/apis", getApiRegistries);

// This handles GET http://localhost:6970/registry/mfes
router.get("/mfes", getMfeRegistries);

module.exports = router;