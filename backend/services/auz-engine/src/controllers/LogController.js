const LogModel = require("../models/LogModel");

const getAllLogs = async (req, res) => {
    try {
        const { from, to } = req.query;
        const filter = {};

        if (from || to) {
            filter.timestamp = {};
            if (from) filter.timestamp.$gte = new Date(from);
            if (to)   filter.timestamp.$lte = new Date(to);
        }

        const logs = await LogModel.find(filter).sort({ timestamp: -1 });

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
        const { from, to } = req.query;
        const filter = { userId };

        if (from || to) {
            filter.timestamp = {};
            if (from) filter.timestamp.$gte = new Date(from);
            if (to)   filter.timestamp.$lte = new Date(to);
        }

        const logs = await LogModel.find(filter).sort({ timestamp: -1 });

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

const getAnalytics = async (req, res) => {
    try {
        const { from, to } = req.query;
        const match = {};

        if (from || to) {
            match.timestamp = {};
            if (from) match.timestamp.$gte = new Date(from);
            if (to)   match.timestamp.$lte = new Date(to);
        }

        const [
            apiFrequency,
            decisionBreakdown,
            trafficOverTime,
            avgResponseByAction,
            statusCodeDist,
            roleActivity,
            topUsers,
        ] = await Promise.all([
            // 1. API call frequency
            LogModel.aggregate([
                { $match: { ...match, action: { $ne: null } } },
                { $group: { _id: "$action", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),

            // 2. Decision breakdown (ALLOW / DENY / BULK)
            LogModel.aggregate([
                { $match: match },
                { $group: { _id: "$decision", count: { $sum: 1 } } },
            ]),

            // 3. Traffic over time (group by hour)
            LogModel.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: {
                            year:  { $year:  "$timestamp" },
                            month: { $month: "$timestamp" },
                            day:   { $dayOfMonth: "$timestamp" },
                            hour:  { $hour:  "$timestamp" },
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
                { $limit: 168 }, // max 7 days × 24h
            ]),

            // 4. Avg response time per action endpoint
            LogModel.aggregate([
                { $match: { ...match, action: { $ne: null }, responseTime: { $ne: null } } },
                {
                    $group: {
                        _id: "$action",
                        avgResponseTime: { $avg: "$responseTime" },
                        maxResponseTime: { $max: "$responseTime" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { avgResponseTime: -1 } },
                { $limit: 10 },
            ]),

            // 5. Status code distribution
            LogModel.aggregate([
                { $match: match },
                { $group: { _id: "$statusCode", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),

            // 6. Role activity
            LogModel.aggregate([
                { $match: { ...match, roleId: { $ne: null } } },
                {
                    $group: {
                        _id: "$roleId",
                        total: { $sum: 1 },
                        allowed: { $sum: { $cond: [{ $eq: ["$decision", "ALLOW"] }, 1, 0] } },
                        denied:  { $sum: { $cond: [{ $eq: ["$decision", "DENY"]  }, 1, 0] } },
                    },
                },
                { $sort: { total: -1 } },
                { $limit: 10 },
            ]),

            // 7. Top users
            LogModel.aggregate([
                { $match: { ...match, userId: { $ne: "NA" } } },
                { $group: { _id: "$userId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),
        ]);

        res.status(200).json({
            success: true,
            data: {
                apiFrequency,
                decisionBreakdown,
                trafficOverTime,
                avgResponseByAction,
                statusCodeDist,
                roleActivity,
                topUsers,
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to compute analytics",
            error: err.message,
        });
    }
};

module.exports = { getAllLogs, getLogsByUserId, getAnalytics };