const express = require("express");
const { createApi, getApis, createBulkApis } = require("../controllers/apiRegistry.controller");

const router = express.Router();

// Base route is determined by index.js
router.post("/", createApi);
router.get("/", getApis);
router.post("/bulk", createBulkApis);

module.exports = router;