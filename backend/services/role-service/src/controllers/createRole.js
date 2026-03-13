const Role = require("../models/Role");

const createRole = async (req, res) => {
    try {
        const { name, description, allowedServices, isTemp, startDate, endDate } = req.body;

        const prev = await Role.findOne({ name: name.trim().toLowerCase() });
        if (prev) {
            return res.status(409).json({ error: `Role "${name}" already exists` });
        }

        if (allowedServices && !Array.isArray(allowedServices)) {
            return res.status(400).json({ error: "allowedServices must be an array" });
        }

        const role = await Role.create({
            name,
            description,
            allowedServices: allowedServices ?? [],
            isTemp,
            ...(isTemp && { startDate, endDate }),
        });

        res.status(201).json(role);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: `Role "${req.body.name}" already exists` });
        }
        res.status(400).json({ error: err.message });
    }
};

module.exports = { createRole };