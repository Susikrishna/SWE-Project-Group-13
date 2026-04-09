const LogModel = require("../models/LogModel");

const getAllLogs = async (req, res) => {
    try {
        const logs = await LogModel.find().sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch logs",
            error: err.message
        });
    }
};

const getLogsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const logs = await LogModel.find({ userId }).sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            data: logs
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch logs for user",
            error: err.message
        });
    }
};

module.exports = { getAllLogs, getLogsByUserId };