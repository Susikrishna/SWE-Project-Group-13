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
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);