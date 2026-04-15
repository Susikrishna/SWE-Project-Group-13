const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
    {
        studentName: { type: String, required: true, trim: true },
        rollNumber: { type: String, required: true, trim: true },
        amount: { type: Number, required: true },
        status: { type: String, required: true, enum: ["Paid", "Pending", "Overdue"], default: "Pending" },
        semester: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("FeePayment", feePaymentSchema);
