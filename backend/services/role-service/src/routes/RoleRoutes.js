const express = require("express");
const router = express.Router();
const { createRole } = require("../controllers/createRole");
const {getRoleById, getRoles} = require("../controllers/getRole") 

router.get("/", getRoles);
router.get("/:id", getRoleById);
router.post("/", createRole);

module.exports = router;