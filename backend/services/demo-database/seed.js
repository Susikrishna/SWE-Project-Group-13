/**
 * Modern Flattened RBAC Database Seed Script
 * Run with: mongosh <your-db-name> seed.js
 */

// ─── 1. Clean Database ──────────────────────────────────────────────────────
db.apiregistries.deleteMany({});
db.mferegistries.deleteMany({});
db.roles.deleteMany({});

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

  // Report Service (Decommissioned)
  { service: "report-service", basePath: "/api/v1/reports", route: "/:id", method: "GET", resource: "report", action: "read", permissionKey: "report-service:report:read", isActive: false },
  { service: "report-service", basePath: "/api/v1/reports", route: "/generate", method: "POST", resource: "report", action: "generate", permissionKey: "report-service:report:generate", isActive: false },
  { service: "report-service", basePath: "/api/v1/reports", route: "/:id/export", method: "GET", resource: "report", action: "export", permissionKey: "report-service:report:export", isActive: false },
  { service: "report-service", basePath: "/api/v1/reports", route: "/schedule", method: "POST", resource: "report", action: "schedule", permissionKey: "report-service:report:schedule", isActive: false },

  // Gradelist Service
  { service: "gradelist-service", basePath: "/api/v1/gradelist", route: "/", method: "GET", resource: "gradelist", action: "read", permissionKey: "gradelist-service:gradelist:read", isActive: true },
  { service: "gradelist-service", basePath: "/api/v1/gradelist", route: "/", method: "POST", resource: "gradelist", action: "create", permissionKey: "gradelist-service:gradelist:create", isActive: true },
  { service: "gradelist-service", basePath: "/api/v1/gradelist", route: "/:id", method: "PUT", resource: "gradelist", action: "update", permissionKey: "gradelist-service:gradelist:update", isActive: true },
  { service: "gradelist-service", basePath: "/api/v1/gradelist", route: "/:id", method: "DELETE", resource: "gradelist", action: "delete", permissionKey: "gradelist-service:gradelist:delete", isActive: true },

  // Fee Service
  { service: "fee-service", basePath: "/api/v1/fees", route: "/", method: "GET", resource: "fee-status", action: "read", permissionKey: "fee-service:fee-status:read", isActive: true },
  { service: "fee-service", basePath: "/api/v1/fees", route: "/", method: "POST", resource: "fee-status", action: "create", permissionKey: "fee-service:fee-status:create", isActive: true },
  { service: "fee-service", basePath: "/api/v1/fees", route: "/:id", method: "PUT", resource: "fee-status", action: "update", permissionKey: "fee-service:fee-status:update", isActive: true },
  { service: "fee-service", basePath: "/api/v1/fees", route: "/:id", method: "DELETE", resource: "fee-status", action: "delete", permissionKey: "fee-service:fee-status:delete", isActive: true },

  // Room Service
  { service: "room-service", basePath: "/api/v1/rooms", route: "/", method: "GET", resource: "room-booking", action: "read", permissionKey: "room-service:room-booking:read", isActive: true },
  { service: "room-service", basePath: "/api/v1/rooms", route: "/", method: "POST", resource: "room-booking", action: "create", permissionKey: "room-service:room-booking:create", isActive: true },
  { service: "room-service", basePath: "/api/v1/rooms", route: "/:id", method: "PUT", resource: "room-booking", action: "update", permissionKey: "room-service:room-booking:update", isActive: true },
  { service: "room-service", basePath: "/api/v1/rooms", route: "/:id", method: "DELETE", resource: "room-booking", action: "delete", permissionKey: "room-service:room-booking:delete", isActive: true }
]);
print("✓ Inserted API Registry documents");

// ─── 3. Seed MFE Registry (Microfrontends) ──────────────────────────────────
db.mferegistries.insertMany([
  {
    name: "Dashboard App",
    feature: "dashboard-mfe",
    route: "/dashboard",
    components: [
      { 
        name: "Main Stats", 
        route: "/stats",
        description: "Dashboard statistics overview",
        allowedPermissions: [
          "billing-service:invoice:read", "billing-service:subscription:read",
          "notification-service:notification:read"
        ]
      },
      { 
        name: "User Profile", 
        route: "/profile",
        description: "Manage personal profile settings",
        allowedPermissions: [
          "user-service:user:read", "user-service:user:update"
        ]
      }
    ],
    allowedPermissions: [],
    remoteUrl: "http://localhost:5000/assets/remoteEntry.js",
    module: "./DashboardApp",
    description: "Main user-facing dashboard microfrontend."
  },
  {
    name: "Admin Panel",
    feature: "admin-mfe",
    route: "/admin",
    components: [
      { 
        name: "User Management", 
        route: "/users",
        description: "Manage platform users and sessions",
        allowedPermissions: [
          "auth-service:session:create", "auth-service:session:revoke", "auth-service:token:refresh", "auth-service:mfa:enable", "auth-service:mfa:disable",
          "user-service:user:read", "user-service:user:create", "user-service:user:update", "user-service:user:delete", "user-service:user:list"
        ]
      },
      { 
        name: "Permissions Overview", 
        route: "/permissions",
        description: "Notification and permission templates",
        allowedPermissions: [
          "notification-service:email:send", "notification-service:sms:send", "notification-service:notification:read", "notification-service:template:manage"
        ]
      }
    ],
    allowedPermissions: [],
    remoteUrl: "http://localhost:5001/assets/remoteEntry.js",
    module: "./AdminApp",
    description: "Internal admin interface for managing users and configuration."
  },
  {
    name: "Analytics Dashboard",
    feature: "analytics-mfe",
    route: "/analytics",
    components: [
      { 
        name: "Sales Reports", 
        route: "/sales",
        description: "Billing and invoice analytics",
        allowedPermissions: [
          "billing-service:invoice:read", "billing-service:subscription:read", "billing-service:payment:refund"
        ]
      },
      { 
        name: "System Metrics", 
        route: "/metrics",
        description: "System performance reports",
        allowedPermissions: [
          "report-service:report:read", "report-service:report:generate", "report-service:report:export", "report-service:report:schedule"
        ]
      }
    ],
    allowedPermissions: [],
    remoteUrl: "http://localhost:5002/assets/remoteEntry.js",
    module: "./AnalyticsApp",
    description: "Business intelligence and analytics microfrontend."
  },
  {
    name: "Gradelist Manager",
    feature: "gradelist-mfe",
    route: "/gradelist",
    remoteUrl: "http://localhost:5173/assets/remoteEntry.js",
    module: "./GradelistApp",
    description: "Manage student grade records (course-rollnumber-grade tuples)."
  },
  {
    name: "Fee Payment Status",
    feature: "fee-status-mfe",
    route: "/fee-status",
    remoteUrl: "http://localhost:5173/assets/remoteEntry.js",
    module: "./FeeStatusApp",
    description: "View and manage student fee payment records."
  },
  {
    name: "Room Booking System",
    feature: "room-booking-mfe",
    route: "/room-booking",
    remoteUrl: "http://localhost:5173/assets/remoteEntry.js",
    module: "./RoomBookingApp",
    description: "Book and manage room reservations."
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
    description: "Customer support staff with read access and limited user management.",
    permissions: [
      "user-service:user:read", "user-service:user:list", "user-service:user:update",
      "billing-service:invoice:read", "billing-service:subscription:read",
      "notification-service:email:send", "notification-service:notification:read"
    ],
    mfeAccess: ["dashboard-mfe"],
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
    description: "Read-only access to analytics, reports, and dashboards.",
    permissions: [
      "report-service:report:read", "report-service:report:export"
    ],
    mfeAccess: ["dashboard-mfe", "analytics-mfe"],
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
    mfeAccess: [],
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
    mfeAccess: ["dashboard-mfe", "analytics-mfe"],
    isTemp: true,
    expiresAt: new Date("2025-08-31T23:59:59Z"),
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
    mfeAccess: ["admin-mfe"],
    isTemp: true,
    expiresAt: new Date("2025-09-30T23:59:59Z"),
    createdAt: new Date("2025-08-25T14:00:00Z"),
    updatedAt: new Date("2025-08-25T14:00:00Z")
  }
]);
print("✓ Inserted 10 Role documents");

print("🚀 Seed complete! Database is hydrated with flattened, high-performance schema.");