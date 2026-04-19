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
            department:     { type: String,   default: null },  // e.g. "engineering", "finance"
            clearance:      { type: String,   default: null },  // string label: "public"|"internal"|"confidential"|"secret"
            clearanceLevel: { type: Number,   default: null },  // numeric: public=1, internal=3, confidential=7, secret=10
            location:       { type: String,   default: null },  // e.g. "office", "remote"
            employeeType:   { type: String,   default: null },  // "fulltime"|"contractor"|"intern"
            customTags:     { type: [String], default: []    }, // free-form tags
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
