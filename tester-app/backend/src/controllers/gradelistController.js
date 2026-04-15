const Gradelist = require("../models/Gradelist");

const getAll = async (req, res) => {
    try {
        const items = await Gradelist.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { course, rollNumber, grade, semester } = req.body;
        if (!course || !rollNumber || !grade || !semester) {
            return res.status(400).json({ error: "course, rollNumber, grade, semester are required" });
        }
        const item = await Gradelist.create({ course, rollNumber, grade, semester });
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const updated = await Gradelist.findByIdAndUpdate(
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
        await Gradelist.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAll, create, update, remove };
