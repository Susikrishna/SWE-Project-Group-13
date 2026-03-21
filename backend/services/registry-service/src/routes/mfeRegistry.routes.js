const express = require("express");
const { createMfe, getMfes } = require("../controllers/mfeRegistry.controller");

const router = express.Router();

// Base route is determined by index.js
router.post("/", createMfe);
router.get("/", getMfes);

module.exports = router;