const express = require("express");
const {
  createPermissionSet,
  getPermissionSets,
  updatePermissionSet,
  deletePermissionSet,
} = require("../controllers/permissionSet.controller");

const router = express.Router();

router.post("/", createPermissionSet);
router.get("/", getPermissionSets);
router.put("/:id", updatePermissionSet);
router.delete("/:id", deletePermissionSet);

module.exports = router;
