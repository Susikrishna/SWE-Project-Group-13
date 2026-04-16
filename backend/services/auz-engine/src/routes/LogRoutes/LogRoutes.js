const express = require("express");
const router = express.Router();
const { getAllLogs, getLogsByUserId, getAnalytics } = require("../../controllers/LogController");

router.get("/analytics", getAnalytics);
router.get("/", getAllLogs);
router.get("/:userId", getLogsByUserId);

module.exports = router;