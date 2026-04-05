const express = require("express");
const { createMfe, getMfes, updateMfe, searchMfes } = require("../controllers/mfeRegistry.controller");

const router = express.Router();

// Base route is determined by index.js
router.post("/", createMfe);
router.get("/", getMfes);
router.get("/search", searchMfes);
router.put("/:id", updateMfe);

module.exports = router;