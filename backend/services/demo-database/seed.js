/**
 * Modern Flattened RBAC Database Seed Script
 * Run with: mongosh <your-db-name> seed.js
 */

// ─── 1. Clean Database ──────────────────────────────────────────────────────
db.apiregistries.deleteMany({});
db.mferegistries.deleteMany({});
db.roles.deleteMany({});
db.users.deleteMany({});

// ─── 2. Seed API Registry (Microservices) ───────────────────────────────────
// FULLY CORRECTED: Added basePath, route, and method to satisfy Mongoose schema
db.apiregistries.insertMany([
  // Auth Service
  { service: "auth-service", basePath: "/api/v1/auth", route: "/sessions", method: "POST", resource: "session", action: "create", permissionKey: "auth-service:session:create", isActive: true },
  { service: "auth-service", basePath: "/api/v1/auth", route: "/sessions/:id", method: "DELETE", resource: "session", action: "revoke", permissionKey: "auth-service:session:revoke", isActive: true },
  { service: "auth-service", basePath: "/api/v1/auth", route: "/tokens/refresh", method: "POST", resource: "token", action: "refresh", permissionKey: "auth-service:token:refresh", isActive: true },
  { service: "auth-service", basePath: "/api/v1/auth", route: "/mfa/enable", method: "POST", resource: "mfa", action: "enable", permissionKey: "auth-service:mfa:enable", isActive: true },
  { service: "auth-service", basePath: "/api/v1/auth", route: "/mfa/disable", method: "POST", resource: "mfa", action: "disable", permissionKey: "auth-service:mfa:disable", isActive: true },

  // User Service
  { service: "user-service", basePath: "/api/v1/users", route: "/:id", method: "GET", resource: "user", action: "read", permissionKey: "user-service:user:read", isActive: true },
  { service: "user-service", basePath: "/api/v1/users", route: "/", method: "POST", resource: "user", action: "create", permissionKey: "user-service:user:create", isActive: true },
  { service: "user-service", basePath: "/api/v1/users", route: "/:id", method: "PUT", resource: "user", action: "update", permissionKey: "user-service:user:update", isActive: true },
  { service: "user-service", basePath: "/api/v1/users", route: "/:id", method: "DELETE", resource: "user", action: "delete", permissionKey: "user-service:user:delete", isActive: true },
  { service: "user-service", basePath: "/api/v1/users", route: "/", method: "GET", resource: "user", action: "list", permissionKey: "user-service:user:list", isActive: true },

  // Billing Service
  { service: "billing-service", basePath: "/api/v1/billing", route: "/invoices/:id", method: "GET", resource: "invoice", action: "read", permissionKey: "billing-service:invoice:read", isActive: true },
  { service: "billing-service", basePath: "/api/v1/billing", route: "/invoices", method: "POST", resource: "invoice", action: "create", permissionKey: "billing-service:invoice:create", isActive: true },
  { service: "billing-service", basePath: "/api/v1/billing", route: "/subscriptions/:id", method: "GET", resource: "subscription", action: "read", permissionKey: "billing-service:subscription:read", isActive: true },
  { service: "billing-service", basePath: "/api/v1/billing", route: "/subscriptions/:id", method: "PUT", resource: "subscription", action: "update", permissionKey: "billing-service:subscription:update", isActive: true },
  { service: "billing-service", basePath: "/api/v1/billing", route: "/subscriptions/:id", method: "DELETE", resource: "subscription", action: "cancel", permissionKey: "billing-service:subscription:cancel", isActive: true },
  { service: "billing-service", basePath: "/api/v1/billing", route: "/payments/:id/refund", method: "POST", resource: "payment", action: "refund", permissionKey: "billing-service:payment:refund", isActive: true },

  // Notification Service
  { service: "notification-service", basePath: "/api/v1/notifications", route: "/email", method: "POST", resource: "email", action: "send", permissionKey: "notification-service:email:send", isActive: true },
  { service: "notification-service", basePath: "/api/v1/notifications", route: "/sms", method: "POST", resource: "sms", action: "send", permissionKey: "notification-service:sms:send", isActive: true },
  { service: "notification-service", basePath: "/api/v1/notifications", route: "/:id", method: "GET", resource: "notification", action: "read", permissionKey: "notification-service:notification:read", isActive: true },
  { service: "notification-service", basePath: "/api/v1/notifications", route: "/templates", method: "PUT", resource: "template", action: "manage", permissionKey: "notification-service:template:manage", isActive: true },

  // Report Service
  { service: "report-service", basePath: "/api/v1/reports", route: "/:id", method: "GET", resource: "report", action: "read", permissionKey: "report-service:report:read", isActive: true },
  { service: "report-service", basePath: "/api/v1/reports", route: "/generate", method: "POST", resource: "report", action: "generate", permissionKey: "report-service:report:generate", isActive: true },
  { service: "report-service", basePath: "/api/v1/reports", route: "/:id/export", method: "GET", resource: "report", action: "export", permissionKey: "report-service:report:export", isActive: true },
  { service: "report-service", basePath: "/api/v1/reports", route: "/schedule", method: "POST", resource: "report", action: "schedule", permissionKey: "report-service:report:schedule", isActive: true }
]);
print("✓ Inserted API Registry documents");

// ─── Permission Groups Used By MFE Registry And Roles ──────────────────────
const DASHBOARD_ROOT_PERMISSIONS = [
  "user-service:user:read",
  "billing-service:invoice:read",
  "billing-service:subscription:read",
  "notification-service:notification:read"
];

const DASHBOARD_PROFILE_PERMISSIONS = [
  "user-service:user:read",
  "user-service:user:update"
];

const ADMIN_ROOT_PERMISSIONS = [
  "auth-service:token:refresh",
  "user-service:user:read",
  "user-service:user:list",
  "notification-service:notification:read"
];

const ADMIN_USER_MANAGEMENT_PERMISSIONS = [
  "auth-service:session:create",
  "auth-service:session:revoke",
  "auth-service:token:refresh",
  "auth-service:mfa:enable",
  "auth-service:mfa:disable",
  "user-service:user:read",
  "user-service:user:create",
  "user-service:user:update",
  "user-service:user:delete",
  "user-service:user:list"
];

const ADMIN_NOTIFICATION_PERMISSIONS = [
  "notification-service:email:send",
  "notification-service:sms:send",
  "notification-service:notification:read",
  "notification-service:template:manage"
];

const ANALYTICS_ROOT_PERMISSIONS = [
  "billing-service:invoice:read",
  "billing-service:subscription:read",
  "report-service:report:read"
];

const ANALYTICS_BILLING_PERMISSIONS = [
  "billing-service:invoice:read",
  "billing-service:invoice:create",
  "billing-service:subscription:read",
  "billing-service:subscription:update",
  "billing-service:subscription:cancel",
  "billing-service:payment:refund"
];

const ANALYTICS_REPORT_PERMISSIONS = [
  "report-service:report:read",
  "report-service:report:generate",
  "report-service:report:export",
  "report-service:report:schedule"
];

// ─── 3. Seed MFE Registry (Microfrontends) ──────────────────────────────────
db.mferegistries.insertMany([
  {
    name: "Dashboard App",
    feature: "dashboard-mfe",
    route: "/dashboard",
    isActive: true,
    components: [
      { 
        name: "Main Stats", 
        route: "/stats",
        description: "Dashboard statistics overview",
        isActive: true,
        allowedPermissions: DASHBOARD_ROOT_PERMISSIONS
      },
      { 
        name: "User Profile", 
        route: "/profile",
        description: "Manage personal profile settings",
        isActive: true,
        allowedPermissions: DASHBOARD_PROFILE_PERMISSIONS
      }
    ],
    allowedPermissions: DASHBOARD_ROOT_PERMISSIONS,
    remoteUrl: "http://localhost:5010/assets/remoteEntry.js",
    module: "./DashboardApp",
    description: "User workspace with account summary, billing overview, and notifications."
  },
  {
    name: "Admin Panel",
    feature: "admin-mfe",
    route: "/admin",
    isActive: true,
    components: [
      { 
        name: "User Management", 
        route: "/users",
        description: "Manage platform users and sessions",
        isActive: true,
        allowedPermissions: ADMIN_USER_MANAGEMENT_PERMISSIONS
      },
      { 
        name: "Permissions Overview", 
        route: "/permissions",
        description: "Notification templates and permission audit utilities",
        isActive: true,
        allowedPermissions: ADMIN_NOTIFICATION_PERMISSIONS
      }
    ],
    allowedPermissions: ADMIN_ROOT_PERMISSIONS,
    remoteUrl: "http://localhost:5011/assets/remoteEntry.js",
    module: "./AdminApp",
    description: "Internal administration tools for users, sessions, security, and notification configuration."
  },
  {
    name: "Analytics Dashboard",
    feature: "analytics-mfe",
    route: "/analytics",
    isActive: true,
    components: [
      { 
        name: "Revenue Overview", 
        route: "/sales",
        description: "Read-only billing and subscription analytics",
        isActive: true,
        allowedPermissions: ANALYTICS_ROOT_PERMISSIONS
      },
      {
        name: "Billing Operations",
        route: "/billing",
        description: "Finance actions for invoices, subscriptions, and refunds",
        isActive: true,
        allowedPermissions: ANALYTICS_BILLING_PERMISSIONS
      },
      { 
        name: "Report Center", 
        route: "/reports",
        description: "Generate, export, and schedule reports",
        isActive: true,
        allowedPermissions: ANALYTICS_REPORT_PERMISSIONS
      }
    ],
    allowedPermissions: ANALYTICS_ROOT_PERMISSIONS,
    remoteUrl: "http://localhost:5012/assets/remoteEntry.js",
    module: "./AnalyticsApp",
    description: "Business intelligence, billing operations, and reporting microfrontend."
  }
]);
print("✓ Inserted MFE Registry documents");

// ─── 4. Seed Roles (10 documents) ───────────────────────────────────────────
db.roles.insertMany([
  {
    _id: "role_super-admin",
    name: "super-admin",
    description: "Unrestricted access to all services and admin interfaces.",
    permissions: [
      "auth-service:session:create", "auth-service:session:revoke", "auth-service:token:refresh", "auth-service:mfa:enable", "auth-service:mfa:disable",
      "user-service:user:read", "user-service:user:create", "user-service:user:update", "user-service:user:delete", "user-service:user:list",
      "billing-service:invoice:read", "billing-service:invoice:create", "billing-service:subscription:read", "billing-service:subscription:update", "billing-service:subscription:cancel", "billing-service:payment:refund",
      "notification-service:email:send", "notification-service:sms:send", "notification-service:notification:read", "notification-service:template:manage",
      "report-service:report:read", "report-service:report:generate", "report-service:report:export", "report-service:report:schedule"
    ],
    mfeAccess: ["dashboard-mfe", "admin-mfe", "analytics-mfe"],
    isTemp: false,
    createdAt: new Date("2024-01-12T08:00:00Z"),
    updatedAt: new Date("2024-01-12T08:00:00Z")
  },
  {
    _id: "role_user",
    name: "user",
    description: "Standard end-user with access to their own data and the dashboard.",
    permissions: [
      "user-service:user:read", "user-service:user:update",
      "billing-service:invoice:read", "billing-service:subscription:read",
      "notification-service:notification:read"
    ],
    mfeAccess: ["dashboard-mfe"],
    isTemp: false,
    createdAt: new Date("2024-01-12T08:30:00Z"),
    updatedAt: new Date("2024-01-12T08:30:00Z")
  },
  {
    _id: "role_support-agent",
    name: "support-agent",
    description: "Customer support staff with dashboard visibility and limited admin tools.",
    permissions: [
      "user-service:user:read", "user-service:user:list", "user-service:user:update",
      "billing-service:invoice:read", "billing-service:subscription:read",
      "notification-service:email:send", "notification-service:notification:read"
    ],
    mfeAccess: ["dashboard-mfe", "admin-mfe"],
    isTemp: false,
    createdAt: new Date("2024-01-20T09:00:00Z"),
    updatedAt: new Date("2024-01-20T09:00:00Z")
  },
  {
    _id: "role_finance-manager",
    name: "finance-manager",
    description: "Full access to billing, invoices, and financial reports.",
    permissions: [
      "billing-service:invoice:read", "billing-service:invoice:create", "billing-service:subscription:read", "billing-service:subscription:update", "billing-service:subscription:cancel", "billing-service:payment:refund",
      "report-service:report:read", "report-service:report:generate", "report-service:report:export", "report-service:report:schedule"
    ],
    mfeAccess: ["dashboard-mfe", "analytics-mfe"],
    isTemp: false,
    createdAt: new Date("2024-02-05T10:00:00Z"),
    updatedAt: new Date("2024-02-05T10:00:00Z")
  },
  {
    _id: "role_platform-admin",
    name: "platform-admin",
    description: "Manages system configuration, auth sessions, and audit logs.",
    permissions: [
      "auth-service:session:revoke", "auth-service:token:refresh", "auth-service:mfa:enable", "auth-service:mfa:disable",
      "user-service:user:read", "user-service:user:list"
    ],
    mfeAccess: ["admin-mfe"],
    isTemp: false,
    createdAt: new Date("2024-02-10T11:00:00Z"),
    updatedAt: new Date("2024-02-10T11:00:00Z")
  },
  {
    _id: "role_analyst",
    name: "analyst",
    description: "Read-only access to analytics and exported reports.",
    permissions: [
      "billing-service:invoice:read", "billing-service:subscription:read",
      "report-service:report:read", "report-service:report:export"
    ],
    mfeAccess: ["analytics-mfe"],
    isTemp: false,
    createdAt: new Date("2024-03-01T09:00:00Z"),
    updatedAt: new Date("2024-03-01T09:00:00Z")
  },
  {
    _id: "role_notification-manager",
    name: "notification-manager",
    description: "Manages notification templates and sends bulk communications.",
    permissions: [
      "notification-service:email:send", "notification-service:sms:send", "notification-service:notification:read", "notification-service:template:manage",
      "user-service:user:read", "user-service:user:list"
    ],
    mfeAccess: ["admin-mfe"],
    isTemp: false,
    createdAt: new Date("2024-04-15T10:00:00Z"),
    updatedAt: new Date("2024-04-15T10:00:00Z")
  },
  {
    _id: "role_guest",
    name: "guest",
    description: "Unauthenticated or trial users with very limited access.",
    permissions: [],
    mfeAccess: ["dashboard-mfe"],
    isTemp: false,
    createdAt: new Date("2024-05-01T08:00:00Z"),
    updatedAt: new Date("2024-05-01T08:00:00Z")
  },
  {
    _id: "role_contractor-dev",
    name: "contractor-dev",
    description: "Temporary developer access for an external contractor engagement.",
    permissions: [
      "user-service:user:read", "user-service:user:list",
      "report-service:report:read", "report-service:report:generate"
    ],
    mfeAccess: ["admin-mfe", "analytics-mfe"],
    isTemp: true,
    expiresAt: new Date("2026-08-31T23:59:59Z"), 
    createdAt: new Date("2025-05-20T12:00:00Z"),
    updatedAt: new Date("2025-05-20T12:00:00Z")
  },
  {
    _id: "role_external-auditor",
    name: "external-auditor",
    description: "Short-term access granted to an external compliance auditor.",
    permissions: [
      "billing-service:invoice:read", "billing-service:subscription:read",
      "report-service:report:read", "report-service:report:export"
    ],
    mfeAccess: ["analytics-mfe"],
    isTemp: true,
    expiresAt: new Date("2026-09-30T23:59:59Z"), 
    createdAt: new Date("2025-08-25T14:00:00Z"),
    updatedAt: new Date("2025-08-25T14:00:00Z")
  }
]);
print("✓ Inserted 10 Role documents");

// ─── 5. Seed Users ──────────────────────────────────────────────────────────
// Password is "password" hashed with bcrypt (10 rounds)
const hashedPassword = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

db.users.insertMany([
  {
    name: "Alice Johnson",
    username: "alice_admin",
    password: hashedPassword,
    roles: ["role_super-admin"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Bob Smith",
    username: "bob_user",
    password: hashedPassword,
    roles: ["role_user"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Carol White",
    username: "carol_support",
    password: hashedPassword,
    roles: ["role_support-agent"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "David Brown",
    username: "david_finance",
    password: hashedPassword,
    roles: ["role_finance-manager"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Eva Martinez",
    username: "eva_analyst",
    password: hashedPassword,
    roles: ["role_analyst"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
print("✓ Inserted 5 User documents");

print("🚀 Seed complete! Database is hydrated with flattened, high-performance schema.");
