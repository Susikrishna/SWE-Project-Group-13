const express = require("express");
const router = express.Router();
const { getUsers, addNewUser, addRoleToUser, clearAllRoles, clearRolesForUser, authenticateUser } = require("../controllers/userControllers");
const verifyAuth = require("../middleware/auth");
const { getMe } = require("../controllers/proxyControllers");

router.get("/", getUsers);
router.post("/", addNewUser);
router.post("/addRole", addRoleToUser);
router.delete("/clearAll", clearAllRoles);
router.delete("/clear", clearRolesForUser);
router.post("/login", authenticateUser);
router.get("/me", verifyAuth, getMe);

module.exports = router;