const mongoose = require("mongoose");

const permissionSetSchema = new mongoose.Schema(
  {
    // Human-readable name (e.g. "Billing Read-Only")
    name: { type: String, required: true, unique: true, trim: true },

    // Optional description explaining what this set is for
    description: { type: String, trim: true },

    // The actual list of permissionKeys this set grants
    permissions: { type: [String], default: [] },

    // Soft-delete / disable flag
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PermissionSet", permissionSetSchema);
