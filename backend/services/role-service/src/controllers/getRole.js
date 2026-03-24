const Role = require("../models/Role");

const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });
        res.status(200).json(roles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id.trim());
        if (!role) {
            return res.status(404).json({ error: "Role not found" });
        }
        res.status(200).json(role);
    } catch (err) {
        console.log("ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getRoles, getRoleById };