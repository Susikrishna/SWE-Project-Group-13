const express = require("express");
const router = express.Router();
const { createRole } = require("../controllers/createRole");
const {getRoleById, getRoles} = require("../controllers/getRole") 
const {deleteRoleByID, deleteRoles} = require("../controllers/deleteRole")
const {editRoleById} = require("../controllers/editRole")
router.get("/", getRoles);
router.get("/:id", getRoleById);
router.post("/", createRole);
router.delete("/",deleteRoleByID)
router.delete("/del", deleteRoles)
router.put("/",editRoleById)

module.exports = router;