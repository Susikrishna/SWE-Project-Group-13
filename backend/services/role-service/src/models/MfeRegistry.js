const mongoose = require("mongoose");

const mfeSchema = new mongoose.Schema({
    feature: { type: String, required: true, unique: true },
    components: [
      {
        name: { type: String, required: true },
        route: { type: String, required: true },
        description: { type: String },
        isActive: { type: Boolean, default: true },
        allowedPermissions: { type: [String], default: [] },
      }
    ],
    allowedPermissions: [String],
});

module.exports = mongoose.model("MfeRegistry", mfeSchema);
