const express = require("express");
const { createApi, getApis, createBulkApis, updateApi, searchApis } = require("../controllers/apiRegistry.controller");

const router = express.Router();

// Base route is determined by index.js
router.post("/", createApi);
router.get("/", getApis);
router.get("/search", searchApis);
router.post("/bulk", createBulkApis);
router.put("/:id", updateApi);

module.exports = router;