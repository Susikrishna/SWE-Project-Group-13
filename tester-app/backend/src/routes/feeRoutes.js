const express = require("express");
const router = express.Router();
const checkPermission = require("../middleware/checkPermission");
const { getAll, create, update, remove } = require("../controllers/feeController");

router.get("/", checkPermission("fee-service:fee-status:read"), getAll);
router.post("/", checkPermission("fee-service:fee-status:create"), create);
router.put("/:id", checkPermission("fee-service:fee-status:update"), update);
router.delete("/:id", checkPermission("fee-service:fee-status:delete"), remove);

module.exports = router;
