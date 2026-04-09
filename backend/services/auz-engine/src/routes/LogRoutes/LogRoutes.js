const express = require("express");
const router = express.Router();
const {getAllLogs,getLogsByUserId} = require("../../controllers/LogController")

router.get("/",  getAllLogs);
router.get("/:userId", getLogsByUserId)

module.exports = router;