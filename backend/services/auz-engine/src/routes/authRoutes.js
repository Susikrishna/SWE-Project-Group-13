const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const loadAccessProfile = require("../middleware/loadAccessProfile");
const { authorize, checkAccess } = require("../controllers/authorizeController");
const {logger} = require("../middleware/LogMiddleware")

// Full Authorization Profile Retrieval (Used by Frontend/Gateway on login)
router.get("/authorize", verifyToken, loadAccessProfile,logger("authorize"), authorize);

// Instant boolean check (Used by backend microservices)
router.post("/check-access", verifyToken, loadAccessProfile,logger("check-access"), checkAccess);

module.exports = router;