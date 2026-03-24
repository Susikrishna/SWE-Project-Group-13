const express = require("express");
const router = express.Router();
const { getUsers, addNewUser,addRoleToUser ,clearAllRoles} = require("../controllers/UserControllers");

router.get("/", getUsers);
router.post("/", addNewUser);
router.post("/addRole", addRoleToUser)
router.delete("/clearAll",clearAllRoles)

module.exports = router;