const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    userId: String,
    roleId: String,
    action: String,  // which endpoint was hit, null for bulk
    permission: String,        // "user-service:user:update"
    decision: { type: String, enum: ["ALLOW", "DENY", "BULK"] },
    reason: String,        // error message if denied
    statusCode: Number,
}, { capped: { size: 10_000_000, max: 50_000 } });

module.exports = mongoose.model("Log", logSchema);