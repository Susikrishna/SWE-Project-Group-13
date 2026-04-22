const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        roles: [
            {
                type: String,
                ref: "Role",
            },
        ],

        attributes: {
            department:  { type: String, default: null },
            clearance:   { type: String, default: null },
            location:    { type: String, default: null },
            employeeType:{ type: String, default: null },
            customTags:  { type: [String], default: [] },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
