const axios = require("axios");

const AUZ_ENGINE_URL = process.env.AUZ_ENGINE_URL || "http://localhost:3000";

/**
 * Helper: Call auz-engine /auth/check-access to verify if the user
 * has the required permission for the given URL + method.
 * Returns { allowed, resolvedPermission, isPublic }.
 */
async function checkPermission(token, url, method) {
    try {
        const response = await axios.post(
            `${AUZ_ENGINE_URL}/auth/check-access`,
            { url, method },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (err) {
        return {
            allowed: false,
            resolvedPermission: null,
            error: err.response?.data?.error || "AUZ Engine unreachable",
        };
    }
}

/**
 * Generic handler factory: creates a demo endpoint that
 * checks permissions via the auz-engine before returning mock data.
 */
function createDemoHandler(checkUrl, checkMethod, mockData) {
    return async (req, res) => {
        const result = await checkPermission(req.token, checkUrl, checkMethod);

        if (!result.allowed) {
            return res.status(403).json({
                error: "Access Denied by RBAC",
                resolvedPermission: result.resolvedPermission,
                detail: `Your role does not include the permission: ${result.resolvedPermission}`,
                auzEngineResponse: result,
            });
        }

        return res.status(200).json({
            message: "Access Granted",
            resolvedPermission: result.resolvedPermission,
            data: mockData,
            auzEngineResponse: result,
        });
    };
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_USERS = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", status: "active" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", status: "active" },
    { id: 3, name: "Carol White", email: "carol@example.com", status: "inactive" },
];

const MOCK_INVOICES = [
    { id: "INV-001", amount: 1250.00, status: "paid", date: "2026-03-15" },
    { id: "INV-002", amount: 890.50, status: "pending", date: "2026-04-01" },
    { id: "INV-003", amount: 2100.00, status: "overdue", date: "2026-02-28" },
];

const MOCK_REPORT = {
    id: "RPT-42",
    title: "Monthly Revenue Report",
    generatedAt: new Date().toISOString(),
    summary: "Total revenue: $45,230. Growth: +12.5%",
};

// ─── Endpoint Handlers ─────────────────────────────────────────────────────

const listUsers = createDemoHandler(
    "/api/v1/users", "GET",
    { users: MOCK_USERS, total: MOCK_USERS.length }
);

const getUser = createDemoHandler(
    "/api/v1/users/123", "GET",
    { user: MOCK_USERS[0] }
);

const createUser = createDemoHandler(
    "/api/v1/users", "POST",
    { message: "User created successfully", user: { id: 4, name: "New User", email: "new@example.com" } }
);

const deleteUser = createDemoHandler(
    "/api/v1/users/123", "DELETE",
    { message: "User deleted successfully", deletedId: 123 }
);

const listInvoices = createDemoHandler(
    "/api/v1/billing/invoices/1", "GET",
    { invoices: MOCK_INVOICES, total: MOCK_INVOICES.length }
);

const generateReport = createDemoHandler(
    "/api/v1/reports/generate", "POST",
    { report: MOCK_REPORT }
);

module.exports = { listUsers, getUser, createUser, deleteUser, listInvoices, generateReport };
