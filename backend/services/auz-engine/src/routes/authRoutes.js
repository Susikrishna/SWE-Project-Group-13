const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { authorize } = require("../controllers/authorizeController");

/**
 * GET /auth/authorize
 *
 * Headers:
 *   Authorization: Bearer <jwt>
 *
 * Returns the caller's role and all assigned microservices / microfrontends.
 */
router.get("/authorize", verifyToken, authorize);

module.exports = router;
