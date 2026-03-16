const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const loadAccessProfile = require("../middleware/loadAccessProfile");
const requirePermission = require("../middleware/requirePermission");
const { authorize, checkAccess } = require("../controllers/authorizeController");

/**
 * GET /auth/authorize
 *
 * Headers:
 *   Authorization: Bearer <jwt>
 *
 * Returns the caller's role and all assigned microservices / microfrontends.
 */
router.get("/authorize", verifyToken, loadAccessProfile, authorize);

/**
 * POST /auth/check-access
 * Body: { "serviceId": "<ObjectId>", "action": "user:update" }
 */
router.post("/check-access", verifyToken, loadAccessProfile, checkAccess);

/**
 * Example protected route using hardcoded required permission.
 * Update service/action to match each downstream route contract.
 */
router.get(
    "/protected/user-update",
    verifyToken,
    loadAccessProfile,
    requirePermission("6650000000000000000000a2", "user:update"),
    (_req, res) => {
        return res.status(200).json({ allowed: true, route: "user:update" });
    }
);

module.exports = router;
