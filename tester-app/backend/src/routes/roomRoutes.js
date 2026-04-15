const express = require("express");
const router = express.Router();
const checkPermission = require("../middleware/checkPermission");
const { getAll, create, update, remove } = require("../controllers/roomController");

router.get("/", checkPermission("room-service:room-booking:read"), getAll);
router.post("/", checkPermission("room-service:room-booking:create"), create);
router.put("/:id", checkPermission("room-service:room-booking:update"), update);
router.delete("/:id", checkPermission("room-service:room-booking:delete"), remove);

module.exports = router;
