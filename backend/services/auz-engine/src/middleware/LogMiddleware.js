// middleware/LogMiddleware.js
const Log = require("../models/LogModel");

const logger = (action) => async (req, res, next) => {
    const origResponse = res.json.bind(res);

    res.json = async (body) => {
        try {
            let decision;
            
            if (action === "authorize") {
                decision = "BULK";
            } else if (res.statusCode >= 200 && res.statusCode < 300) {
                decision = "ALLOW";
            } else {
                decision = "DENY";
            }
            await Log.create({
                timestamp: new Date(),
                userId: req.accessProfile?.userId ?? "NA",
                roleId: req.accessProfile?.roleIds[0] ?? null,
                action,
                permission: req.body?.permissionKey ?? null,
                decision,
                reason: body?.error ?? null,
                statusCode: res.statusCode,
            });
        } catch (err) {
            console.error("Logging failed:", err.message);
        }

        return origResponse(body);
    };

    next();
};

module.exports = { logger };