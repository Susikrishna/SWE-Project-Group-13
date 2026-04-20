const express = require("express");
const router = express.Router();
const {
    getUsers,
    addNewUser,
    addRoleToUser,
    updateUserAttributes,
    clearAllRoles,
    clearRolesForUser,
} = require("../controllers/UserControllers");

router.get("/",           getUsers);
router.post("/",          addNewUser);
router.post("/addRole",   addRoleToUser);
router.put("/attributes", updateUserAttributes);   // ← NEW: ABAC attribute update
router.delete("/clearAll", clearAllRoles);
router.delete("/clear",   clearRolesForUser);

module.exports = router;
