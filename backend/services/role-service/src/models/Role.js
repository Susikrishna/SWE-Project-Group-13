const mongoose = require("mongoose");

const serviceAccessSchema = new mongoose.Schema(
    {
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRegistry",
            required: true,
        },
        actions: {
            type: [String],
            required: true,
            validate: {
                validator: (actions) => actions.length > 0,
                message: "At least one action is required per service",
            },
        },
    },
    { _id: false }
);

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            trim: true,
        },
        allowedServices: {
            type: [serviceAccessSchema],
            default: [],
            validate: {
                validator: function (services) {
                    const set = new Set(services.map((s) => s.serviceId.toString()));
                    return set.size === services.length;
                },
                message: "Duplicate service entries are not allowed in a role",
            },
        },
        isTemp: {
            type: Boolean,
            default: false,
        },
        startDate: {
            type: Date,
            required: function () { return this.isTemp; },
        },
        endDate: {
            type: Date,
            required: function () { return this.isTemp; },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);