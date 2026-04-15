const RoomBooking = require("../models/RoomBooking");

const getAll = async (req, res) => {
    try {
        const items = await RoomBooking.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { room, date, timeSlot, purpose, bookedBy } = req.body;
        if (!room || !date || !timeSlot || !purpose || !bookedBy) {
            return res.status(400).json({ error: "room, date, timeSlot, purpose, bookedBy are required" });
        }
        const item = await RoomBooking.create({ room, date, timeSlot, purpose, bookedBy });
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const updated = await RoomBooking.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Not found" });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await RoomBooking.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAll, create, update, remove };
