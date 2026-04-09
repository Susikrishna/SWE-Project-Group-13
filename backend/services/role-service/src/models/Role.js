const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
    {
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
        // Flattened array of API permission strings (e.g., ["user-svc:profile:read"])
        permissions: {
            type: [String],
            default: [],
        },
        // Flattened array of frontend feature IDs (e.g., ["set-ui"])
        mfeAccess: {
            type: [String],
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