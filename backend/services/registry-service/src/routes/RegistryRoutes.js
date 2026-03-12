const express = require("express");
const router = express.Router();
const { createRegistryEntry, getRegistries } = require("../controllers/RegistryController");

router.get("/", getRegistries);
router.post("/", createRegistryEntry);

module.exports = router;