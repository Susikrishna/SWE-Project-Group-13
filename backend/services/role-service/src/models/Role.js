const mongoose = require("mongoose");

const role = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    microfrontends: [{ type: String }],
    microservices: [{ type: String }],
    isTemp: { type: Boolean, default: false },
    startDate: { type: Date, required: function () { return this.isTemp } },
    endDate: { type: Date, required: function () { return this.isTemp } },
}, { timestamps: true });

module.exports = mongoose.model("Role", role);