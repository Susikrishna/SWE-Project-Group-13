const mongoose = require("mongoose");

const mfeSchema = new mongoose.Schema({
    feature: { type: String, required: true, unique: true },
    allowedPermissions: [String],
});

module.exports = mongoose.model("MfeRegistry", mfeSchema);
