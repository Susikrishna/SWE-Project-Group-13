/**
 * MongoDB Seed Data
 * Run with: mongosh <your-db-name> seed.js
 * Or import via: mongoimport / MongoDB Compass
 */

// ─── ObjectIds for cross-referencing ────────────────────────────────────────

const ids = {
  authSvc:      ObjectId("6650000000000000000000a1"),
  userSvc:      ObjectId("6650000000000000000000a2"),
  bilingSvc:    ObjectId("6650000000000000000000a3"),
  notifSvc:     ObjectId("6650000000000000000000a4"),
  reportSvc:    ObjectId("6650000000000000000000a5"),
  dashboardMfe: ObjectId("6650000000000000000000a6"),
  adminMfe:     ObjectId("6650000000000000000000a7"),
  analyticsMfe: ObjectId("6650000000000000000000a8"),
};

// ─── ServiceRegistry (8 documents) ──────────────────────────────────────────

db.serviceregistries.insertMany([
  {
    _id: ids.authSvc,
    serviceName: "Auth Service",
    serviceIdentifier: "auth-service",
    description: "Handles authentication, token issuance, and session management.",
    serviceType: "microservice",
    baseUrl: "https://auth.internal.example.com",
    exposedPermissions: [
      { resource: "session",  action: "create",  description: "Issue a new login session" },
      { resource: "session",  action: "revoke",  description: "Revoke an active session" },
      { resource: "token",    action: "refresh", description: "Refresh an access token" },
      { resource: "mfa",      action: "enable",  description: "Enable multi-factor authentication" },
      { resource: "mfa",      action: "disable", description: "Disable multi-factor authentication" },
    ],
    isActive: true,
    createdAt: new Date("2024-01-10T08:00:00Z"),
    updatedAt: new Date("2024-01-10T08:00:00Z"),
  },
  {
    _id: ids.userSvc,
    serviceName: "User Service",
    serviceIdentifier: "user-service",
    description: "Manages user profiles, preferences, and account lifecycle.",
    serviceType: "microservice",
    baseUrl: "https://users.internal.example.com",
    exposedPermissions: [
      { resource: "user", action: "read",   description: "Read any user profile" },
      { resource: "user", action: "create", description: "Create a new user account" },
      { resource: "user", action: "update", description: "Update user profile details" },
      { resource: "user", action: "delete", description: "Delete a user account" },
      { resource: "user", action: "list",   description: "List all users with filters" },
    ],
    isActive: true,
    createdAt: new Date("2024-01-11T09:00:00Z"),
    updatedAt: new Date("2024-05-01T12:00:00Z"),
  },
  {
    _id: ids.bilingSvc,
    serviceName: "Billing Service",
    serviceIdentifier: "billing-service",
    description: "Handles subscriptions, invoices, and payment processing.",
    serviceType: "microservice",
    baseUrl: "https://billing.internal.example.com",
    exposedPermissions: [
      { resource: "invoice",      action: "read",   description: "View invoices" },
      { resource: "invoice",      action: "create", description: "Generate a new invoice" },
      { resource: "subscription", action: "read",   description: "View subscription details" },
      { resource: "subscription", action: "update", description: "Change subscription plan" },
      { resource: "subscription", action: "cancel", description: "Cancel an active subscription" },
      { resource: "payment",      action: "refund", description: "Issue a payment refund" },
    ],
    isActive: true,
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z"),
  },
  {
    _id: ids.notifSvc,
    serviceName: "Notification Service",
    serviceIdentifier: "notification-service",
    description: "Sends email, SMS, and push notifications to users.",
    serviceType: "microservice",
    baseUrl: "https://notify.internal.example.com",
    exposedPermissions: [
      { resource: "email",        action: "send",     description: "Send an email notification" },
      { resource: "sms",          action: "send",     description: "Send an SMS notification" },
      { resource: "notification", action: "read",     description: "View notification history" },
      { resource: "template",     action: "manage",   description: "Create and edit notification templates" },
    ],
    isActive: true,
    createdAt: new Date("2024-02-01T11:00:00Z"),
    updatedAt: new Date("2024-02-01T11:00:00Z"),
  },
  {
    _id: ids.reportSvc,
    serviceName: "Report Service",
    serviceIdentifier: "report-service",
    description: "Generates and exports business reports and data exports.",
    serviceType: "microservice",
    baseUrl: "https://reports.internal.example.com",
    exposedPermissions: [
      { resource: "report", action: "read",     description: "View generated reports" },
      { resource: "report", action: "generate", description: "Trigger report generation" },
      { resource: "report", action: "export",   description: "Export report as PDF/CSV" },
      { resource: "report", action: "schedule", description: "Schedule recurring reports" },
    ],
    isActive: false,  // decommissioned — useful to have an inactive service in seed
    createdAt: new Date("2024-03-01T08:00:00Z"),
    updatedAt: new Date("2024-08-20T16:00:00Z"),
  },
  {
    _id: ids.dashboardMfe,
    serviceName: "Dashboard App",
    serviceIdentifier: "dashboard-mfe",
    description: "Main user-facing dashboard microfrontend.",
    serviceType: "microfrontend",
    baseUrl: "https://app.example.com/dashboard",
    exposedPermissions: [
      { resource: "dashboard", action: "view",      description: "Access the main dashboard" },
      { resource: "widget",    action: "customize", description: "Add or rearrange dashboard widgets" },
    ],
    isActive: true,
    createdAt: new Date("2024-03-15T09:00:00Z"),
    updatedAt: new Date("2024-03-15T09:00:00Z"),
  },
  {
    _id: ids.adminMfe,
    serviceName: "Admin Panel",
    serviceIdentifier: "admin-mfe",
    description: "Internal admin interface for managing users and configuration.",
    serviceType: "microfrontend",
    baseUrl: "https://admin.example.com",
    exposedPermissions: [
      { resource: "admin-panel", action: "access",          description: "Log into the admin panel" },
      { resource: "config",      action: "read",            description: "View system configuration" },
      { resource: "config",      action: "update",          description: "Modify system configuration" },
      { resource: "audit-log",   action: "read",            description: "Read audit logs" },
    ],
    isActive: true,
    createdAt: new Date("2024-04-01T10:00:00Z"),
    updatedAt: new Date("2024-04-01T10:00:00Z"),
  },
  {
    _id: ids.analyticsMfe,
    serviceName: "Analytics Dashboard",
    serviceIdentifier: "analytics-mfe",
    description: "Business intelligence and analytics microfrontend.",
    serviceType: "microfrontend",
    baseUrl: "https://app.example.com/analytics",
    exposedPermissions: [
      { resource: "analytics", action: "view",   description: "View analytics charts and KPIs" },
      { resource: "analytics", action: "export", description: "Export analytics data" },
      { resource: "funnel",    action: "build",  description: "Build custom conversion funnels" },
    ],
    isActive: true,
    createdAt: new Date("2024-05-10T08:30:00Z"),
    updatedAt: new Date("2024-05-10T08:30:00Z"),
  },
]);

print("✓ Inserted 8 ServiceRegistry documents");

// ─── Roles (10 documents) ────────────────────────────────────────────────────

db.roles.insertMany([
  // 1. Super Admin — full access everywhere
  {
    name: "super-admin",
    description: "Unrestricted access to all services and admin interfaces.",
    allowedServices: [
      { serviceId: ids.authSvc,      actions: ["session:create", "session:revoke", "token:refresh", "mfa:enable", "mfa:disable"] },
      { serviceId: ids.userSvc,      actions: ["user:read", "user:create", "user:update", "user:delete", "user:list"] },
      { serviceId: ids.bilingSvc,    actions: ["invoice:read", "invoice:create", "subscription:read", "subscription:update", "subscription:cancel", "payment:refund"] },
      { serviceId: ids.notifSvc,     actions: ["email:send", "sms:send", "notification:read", "template:manage"] },
      { serviceId: ids.reportSvc,    actions: ["report:read", "report:generate", "report:export", "report:schedule"] },
      { serviceId: ids.dashboardMfe, actions: ["dashboard:view", "widget:customize"] },
      { serviceId: ids.adminMfe,     actions: ["admin-panel:access", "config:read", "config:update", "audit-log:read"] },
      { serviceId: ids.analyticsMfe, actions: ["analytics:view", "analytics:export", "funnel:build"] },
    ],
    isTemp: false,
    createdAt: new Date("2024-01-12T08:00:00Z"),
    updatedAt: new Date("2024-01-12T08:00:00Z"),
  },

  // 2. Regular User — read-only + dashboard
  {
    name: "user",
    description: "Standard end-user with access to their own data and the dashboard.",
    allowedServices: [
      { serviceId: ids.userSvc,      actions: ["user:read", "user:update"] },
      { serviceId: ids.bilingSvc,    actions: ["invoice:read", "subscription:read"] },
      { serviceId: ids.notifSvc,     actions: ["notification:read"] },
      { serviceId: ids.dashboardMfe, actions: ["dashboard:view"] },
    ],
    isTemp: false,
    createdAt: new Date("2024-01-12T08:30:00Z"),
    updatedAt: new Date("2024-01-12T08:30:00Z"),
  },

  // 3. Support Agent
  {
    name: "support-agent",
    description: "Customer support staff with read access and limited user management.",
    allowedServices: [
      { serviceId: ids.userSvc,      actions: ["user:read", "user:list", "user:update"] },
      { serviceId: ids.bilingSvc,    actions: ["invoice:read", "subscription:read"] },
      { serviceId: ids.notifSvc,     actions: ["email:send", "notification:read"] },
      { serviceId: ids.dashboardMfe, actions: ["dashboard:view"] },
    ],
    isTemp: false,
    createdAt: new Date("2024-01-20T09:00:00Z"),
    updatedAt: new Date("2024-01-20T09:00:00Z"),
  },

  // 4. Finance Manager
  {
    name: "finance-manager",
    description: "Full access to billing, invoices, and financial reports.",
    allowedServices: [
      { serviceId: ids.bilingSvc,    actions: ["invoice:read", "invoice:create", "subscription:read", "subscription:update", "subscription:cancel", "payment:refund"] },
      { serviceId: ids.reportSvc,    actions: ["report:read", "report:generate", "report:export", "report:schedule"] },
      { serviceId: ids.analyticsMfe, actions: ["analytics:view", "analytics:export"] },
      { serviceId: ids.dashboardMfe, actions: ["dashboard:view"] },
    ],
    isTemp: false,
    createdAt: new Date("2024-02-05T10:00:00Z"),
    updatedAt: new Date("2024-02-05T10:00:00Z"),
  },

  // 5. DevOps / Platform Admin
  {
    name: "platform-admin",
    description: "Manages system configuration, auth sessions, and audit logs.",
    allowedServices: [
      { serviceId: ids.authSvc,  actions: ["session:revoke", "token:refresh", "mfa:enable", "mfa:disable"] },
      { serviceId: ids.adminMfe, actions: ["admin-panel:access", "config:read", "config:update", "audit-log:read"] },
      { serviceId: ids.userSvc,  actions: ["user:read", "user:list"] },
    ],
    isTemp: false,
    createdAt: new Date("2024-02-10T11:00:00Z"),
    updatedAt: new Date("2024-02-10T11:00:00Z"),
  },

  // 6. Read-Only Analyst
  {
    name: "analyst",
    description: "Read-only access to analytics, reports, and dashboards.",
    allowedServices: [
      { serviceId: ids.reportSvc,    actions: ["report:read", "report:export"] },
      { serviceId: ids.analyticsMfe, actions: ["analytics:view", "analytics:export", "funnel:build"] },
      { serviceId: ids.dashboardMfe, actions: ["dashboard:view", "widget:customize"] },
    ],
    isTemp: false,
    createdAt: new Date("2024-03-01T09:00:00Z"),
    updatedAt: new Date("2024-03-01T09:00:00Z"),
  },

  // 7. Notification Manager
  {
    name: "notification-manager",
    description: "Manages notification templates and sends bulk communications.",
    allowedServices: [
      { serviceId: ids.notifSvc, actions: ["email:send", "sms:send", "notification:read", "template:manage"] },
      { serviceId: ids.userSvc,  actions: ["user:read", "user:list"] },
    ],
    isTemp: false,
    createdAt: new Date("2024-04-15T10:00:00Z"),
    updatedAt: new Date("2024-04-15T10:00:00Z"),
  },

  // 8. Guest — minimal read-only
  {
    name: "guest",
    description: "Unauthenticated or trial users with very limited access.",
    allowedServices: [
      { serviceId: ids.dashboardMfe, actions: ["dashboard:view"] },
    ],
    isTemp: false,
    createdAt: new Date("2024-05-01T08:00:00Z"),
    updatedAt: new Date("2024-05-01T08:00:00Z"),
  },

  // 9. Temporary Contractor — time-bounded
  {
    name: "contractor-dev",
    description: "Temporary developer access for an external contractor engagement.",
    allowedServices: [
      { serviceId: ids.userSvc,      actions: ["user:read", "user:list"] },
      { serviceId: ids.reportSvc,    actions: ["report:read", "report:generate"] },
      { serviceId: ids.analyticsMfe, actions: ["analytics:view"] },
      { serviceId: ids.dashboardMfe, actions: ["dashboard:view"] },
    ],
    isTemp: true,
    startDate: new Date("2025-06-01T00:00:00Z"),
    endDate:   new Date("2025-08-31T23:59:59Z"),
    createdAt: new Date("2025-05-20T12:00:00Z"),
    updatedAt: new Date("2025-05-20T12:00:00Z"),
  },

  // 10. Temporary Auditor — time-bounded
  {
    name: "external-auditor",
    description: "Short-term access granted to an external compliance auditor.",
    allowedServices: [
      { serviceId: ids.adminMfe,     actions: ["audit-log:read", "config:read"] },
      { serviceId: ids.bilingSvc,    actions: ["invoice:read", "subscription:read"] },
      { serviceId: ids.reportSvc,    actions: ["report:read", "report:export"] },
    ],
    isTemp: true,
    startDate: new Date("2025-09-01T00:00:00Z"),
    endDate:   new Date("2025-09-30T23:59:59Z"),
    createdAt: new Date("2025-08-25T14:00:00Z"),
    updatedAt: new Date("2025-08-25T14:00:00Z"),
  },
]);

print("✓ Inserted 10 Role documents");
print("Seed complete.");