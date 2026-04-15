const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const loadAccessProfile = require("../middleware/loadAccessProfile");
const requirePermission = require("../middleware/requirePermission");
const { authorize, checkAccess } = require("../controllers/authorizeController");
const {logger} = require("../middleware/LogMiddleware")

// Full Authorization Profile Retrieval (Used by Frontend/Gateway on login)
router.get("/authorize", verifyToken, loadAccessProfile, logger("authorize"), authorize);

// Instant boolean check (Used by backend microservices)
router.post("/check-access", verifyToken, loadAccessProfile,logger("check-access"), checkAccess);

// Example route proving the middleware works with the new string format
router.get(
    "/protected/user-update",
    verifyToken,
    loadAccessProfile,
    logger("protected-route"),
    requirePermission("user-service:user:update"),
    (_req, res) => res.status(200).json({ allowed: true, message: "Welcome Admin!" })
);

module.exports = router;