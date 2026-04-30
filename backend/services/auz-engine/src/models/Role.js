const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
    {
        // Custom string ID matching your DB design (e.g., 'role_support')
        _id: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        // References to PermissionSet docs in registry-service.
        // Used by loadAccessProfile to compute the effective permission union.
        permissionSets: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        isTemp: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
            default: null,
            required: function () { return this.isTemp; },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);