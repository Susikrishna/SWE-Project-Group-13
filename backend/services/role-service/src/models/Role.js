const mongoose = require("mongoose");

const role = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    microfrontends: [{ type: String }],
    microservices: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Role", role);