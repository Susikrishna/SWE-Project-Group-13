/**
 * Modern RBAC Database Seed Script
 * Run this script to populate the flattened ApiRegistry, MfeRegistry, and Roles.
 */

// 1. Clear existing collections
db.apiregistries.deleteMany({});
db.mferegistries.deleteMany({});
db.roles.deleteMany({});

// 2. Seed API Registry (Microservices)
// Note: Base URLs are omitted here as they belong in the API Gateway config (.env)
db.apiregistries.insertMany([
  // --- Auth Service ---
  { service: "auth-svc", resource: "session", action: "create", permissionKey: "auth-svc:session:create", isActive: true },
  { service: "auth-svc", resource: "session", action: "revoke", permissionKey: "auth-svc:session:revoke", isActive: true },
  { service: "auth-svc", resource: "token", action: "refresh", permissionKey: "auth-svc:token:refresh", isActive: true },
  { service: "auth-svc", resource: "mfa", action: "enable", permissionKey: "auth-svc:mfa:enable", isActive: true },
  { service: "auth-svc", resource: "mfa", action: "disable", permissionKey: "auth-svc:mfa:disable", isActive: true },

  // --- User Service ---
  { service: "user-svc", resource: "user", action: "read", permissionKey: "user-svc:user:read", isActive: true },
  { service: "user-svc", resource: "user", action: "create", permissionKey: "user-svc:user:create", isActive: true },
  { service: "user-svc", resource: "user", action: "update", permissionKey: "user-svc:user:update", isActive: true },
  { service: "user-svc", resource: "user", action: "delete", permissionKey: "user-svc:user:delete", isActive: true },
  { service: "user-svc", resource: "user", action: "list", permissionKey: "user-svc:user:list", isActive: true },

  // --- Billing Service ---
  { service: "billing-svc", resource: "invoice", action: "read", permissionKey: "billing-svc:invoice:read", isActive: true },
  { service: "billing-svc", resource: "invoice", action: "create", permissionKey: "billing-svc:invoice:create", isActive: true },
  { service: "billing-svc", resource: "subscription", action: "read", permissionKey: "billing-svc:subscription:read", isActive: true },
  { service: "billing-svc", resource: "subscription", action: "update", permissionKey: "billing-svc:subscription:update", isActive: true },
  { service: "billing-svc", resource: "subscription", action: "cancel", permissionKey: "billing-svc:subscription:cancel", isActive: true },
  { service: "billing-svc", resource: "payment", action: "refund", permissionKey: "billing-svc:payment:refund", isActive: true },

  // --- Notification Service ---
  { service: "notify-svc", resource: "email", action: "send", permissionKey: "notify-svc:email:send", isActive: true },
  { service: "notify-svc", resource: "sms", action: "send", permissionKey: "notify-svc:sms:send", isActive: true },
  { service: "notify-svc", resource: "notification", action: "read", permissionKey: "notify-svc:notification:read", isActive: true },
  { service: "notify-svc", resource: "template", action: "manage", permissionKey: "notify-svc:template:manage", isActive: true }
]);

// 3. Seed MFE Registry (Microfrontends)
// Note: Includes remote URLs for Webpack Module Federation
db.mferegistries.insertMany([
  {
    name: "Dashboard",
    feature: "dashboard-mfe",
    route: "/dashboard",
    remoteUrl: "https://app.example.com/dashboard/remoteEntry.js",
    module: "./DashboardApp",
    description: "Main dashboard UI."
  },
  {
    name: "Admin Panel",
    feature: "admin-mfe",
    route: "/admin",
    remoteUrl: "https://admin.example.com/remoteEntry.js",
    module: "./AdminApp",
    description: "Admin interface."
  },
  {
    name: "Analytics",
    feature: "analytics-mfe",
    route: "/analytics",
    remoteUrl: "https://app.example.com/analytics/remoteEntry.js",
    module: "./AnalyticsApp",
    description: "Analytics dashboard."
  }
]);

// 4. Seed Roles (Flattened)
// Notice there are no ObjectIds here. Just the human-readable slug (_id) and flat arrays.
db.roles.insertMany([
  {
    _id: "role_super-admin",
    name: "Super Admin",
    description: "Full system access.",
    permissions: [
      "auth-svc:session:create", "auth-svc:session:revoke", "auth-svc:token:refresh", "auth-svc:mfa:enable", "auth-svc:mfa:disable",
      "user-svc:user:read", "user-svc:user:create", "user-svc:user:update", "user-svc:user:delete", "user-svc:user:list",
      "billing-svc:invoice:read", "billing-svc:invoice:create", "billing-svc:subscription:read", "billing-svc:subscription:update", "billing-svc:subscription:cancel", "billing-svc:payment:refund"
    ],
    mfeAccess: [
      "dashboard-mfe",
      "admin-mfe",
      "analytics-mfe"
    ],
    isTemp: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "role_user",
    name: "Standard User",
    description: "Regular authenticated user access.",
    permissions: [
      "user-svc:user:read",
      "user-svc:user:update"
    ],
    mfeAccess: [
      "dashboard-mfe"
    ],
    isTemp: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "role_guest",
    name: "Guest",
    description: "Read-only unauthenticated access.",
    permissions: [], // No API write access
    mfeAccess: [
      "dashboard-mfe"
    ],
    isTemp: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("✅ Seed complete! Database is hydrated with flattened schemas.");