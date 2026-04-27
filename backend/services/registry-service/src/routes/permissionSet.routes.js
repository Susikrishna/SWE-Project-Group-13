const express = require("express");
const {
  createPermissionSet,
  getPermissionSets,
  getPermissionSetById,
  updatePermissionSet,
  deletePermissionSet,
  resolvePermissionSets,
} = require("../controllers/permissionSet.controller");

const router = express.Router();

router.get("/", getPermissionSets);
router.get("/:id", getPermissionSetById);
router.post("/", createPermissionSet);
router.post("/resolve", resolvePermissionSets);   // internal: used by role-service
router.patch("/:id", updatePermissionSet);
router.delete("/:id", deletePermissionSet);

module.exports = router;
