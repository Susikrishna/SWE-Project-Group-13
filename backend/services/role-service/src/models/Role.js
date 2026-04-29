const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema({
    attribute: { type: String, required: true },   // subject attribute key, e.g. "department"
    operator: {
        type: String,
        enum: ["eq", "neq", "in", "nin", "gte_clearance"],
        required: true,
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // string, number, or array
}, { _id: false });

const policySchema = new mongoose.Schema({
    permissionKey: { type: String, required: true },

    // Human-readable label shown in the UI, e.g. "Finance dept only"
    label: { type: String, default: "" },

    // Logical AND of all conditions
    conditions: { type: [conditionSchema], default: [] },
}, { _id: false });

// ─── Role Schema 
const roleSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },

        permissions: { type: [String], default: [] },

        mfeAccess: { type: [String], default: [] },

        // References to PermissionSet documents in registry-service DB.
        // Effective permissions = union(direct permissions, apis from all attached sets).
        permissionSets: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],

        isTemp: { type: Boolean, default: false },
        expiresAt: {
            type: Date,
            default: null,
            required: function () { return this.isTemp; },
        },

        abacPolicies: { type: [policySchema], default: [] },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
