const FeePayment = require("../models/FeePayment");

const getAll = async (req, res) => {
    try {
        const items = await FeePayment.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { studentName, rollNumber, amount, status, semester } = req.body;
        if (!studentName || !rollNumber || !amount || !semester) {
            return res.status(400).json({ error: "studentName, rollNumber, amount, semester are required" });
        }
        const item = await FeePayment.create({ studentName, rollNumber, amount, status: status || "Pending", semester });
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const updated = await FeePayment.findByIdAndUpdate(
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
        await FeePayment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAll, create, update, remove };
