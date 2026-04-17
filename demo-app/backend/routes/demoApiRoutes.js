const express = require("express");
const router = express.Router();
const verifyAuth = require("../middleware/auth");
const {
    listUsers,
    getUser,
    createUser,
    deleteUser,
    listInvoices,
    generateReport,
} = require("../controllers/demoApiControllers");

// All endpoints are protected by JWT + auz-engine RBAC
router.get("/users", verifyAuth, listUsers);
router.get("/users/:id", verifyAuth, getUser);
router.post("/users", verifyAuth, createUser);
router.delete("/users/:id", verifyAuth, deleteUser);
router.get("/invoices", verifyAuth, listInvoices);
router.post("/reports/generate", verifyAuth, generateReport);

module.exports = router;
