const express = require("express");
const router = express.Router();
const checkPermission = require("../middleware/checkPermission");
const { getAll, create, update, remove } = require("../controllers/gradelistController");

router.get("/", checkPermission("gradelist-service:gradelist:read"), getAll);
router.post("/", checkPermission("gradelist-service:gradelist:create"), create);
router.put("/:id", checkPermission("gradelist-service:gradelist:update"), update);
router.delete("/:id", checkPermission("gradelist-service:gradelist:delete"), remove);

module.exports = router;
