const express = require("express");
const router = express.Router();
const verifyAuth = require("../middleware/auth");
const { proxyAuthorize, proxyCheckAccess } = require("../controllers/proxyControllers");

router.get("/authorize", verifyAuth, proxyAuthorize);
router.post("/check-access", verifyAuth, proxyCheckAccess);

module.exports = router;
