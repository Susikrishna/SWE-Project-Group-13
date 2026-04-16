const mongoose = require("mongoose");

const roomBookingSchema = new mongoose.Schema(
    {
        room: { type: String, required: true, trim: true },
        date: { type: String, required: true, trim: true },
        timeSlot: { type: String, required: true, trim: true },
        purpose: { type: String, required: true, trim: true },
        bookedBy: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("RoomBooking", roomBookingSchema);
