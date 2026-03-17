const ObjectId = globalThis.ObjectId

const ids = {
  authSvc:      ObjectId("6650000000000000000000a1"),
  userSvc:      ObjectId("6650000000000000000000a2"),
  billingSvc:   ObjectId("6650000000000000000000a3"),
  notifSvc:     ObjectId("6650000000000000000000a4"),
  reportSvc:    ObjectId("6650000000000000000000a5"),
  dashboardMfe: ObjectId("6650000000000000000000a6"),
  adminMfe:     ObjectId("6650000000000000000000a7"),
  analyticsMfe: ObjectId("6650000000000000000000a8"),
}

db.serviceregistries.deleteMany({})
db.roles.deleteMany({})

db.serviceregistries.insertMany([
{
_id: ids.authSvc,
serviceName: "Auth Service",
serviceIdentifier: "auth-service",
description: "Handles authentication and token issuance.",
serviceType: "microservice",
baseUrl: "https://auth.internal.example.com",
exposedPermissions: [
{ resource: "session", action: "create" },
{ resource: "session", action: "revoke" },
{ resource: "token", action: "refresh" },
{ resource: "mfa", action: "enable" },
{ resource: "mfa", action: "disable" }
],
isActive: true,
createdAt: new Date(),
updatedAt: new Date()
},
{
_id: ids.userSvc,
serviceName: "User Service",
serviceIdentifier: "user-service",
description: "User management service.",
serviceType: "microservice",
baseUrl: "https://users.internal.example.com",
exposedPermissions: [
{ resource: "user", action: "read" },
{ resource: "user", action: "create" },
{ resource: "user", action: "update" },
{ resource: "user", action: "delete" },
{ resource: "user", action: "list" }
],
isActive: true,
createdAt: new Date(),
updatedAt: new Date()
},
{
_id: ids.billingSvc,
serviceName: "Billing Service",
serviceIdentifier: "billing-service",
description: "Handles invoices and subscriptions.",
serviceType: "microservice",
baseUrl: "https://billing.internal.example.com",
exposedPermissions: [
{ resource: "invoice", action: "read" },
{ resource: "invoice", action: "create" },
{ resource: "subscription", action: "read" },
{ resource: "subscription", action: "update" },
{ resource: "subscription", action: "cancel" },
{ resource: "payment", action: "refund" }
],
isActive: true,
createdAt: new Date(),
updatedAt: new Date()
},
{
_id: ids.notifSvc,
serviceName: "Notification Service",
serviceIdentifier: "notification-service",
description: "Handles emails and SMS.",
serviceType: "microservice",
baseUrl: "https://notify.internal.example.com",
exposedPermissions: [
{ resource: "email", action: "send" },
{ resource: "sms", action: "send" },
{ resource: "notification", action: "read" },
{ resource: "template", action: "manage" }
],
isActive: true,
createdAt: new Date(),
updatedAt: new Date()
},
{
_id: ids.reportSvc,
serviceName: "Report Service",
serviceIdentifier: "report-service",
description: "Report generation service.",
serviceType: "microservice",
baseUrl: "https://reports.internal.example.com",
exposedPermissions: [
{ resource: "report", action: "read" },
{ resource: "report", action: "generate" },
{ resource: "report", action: "export" },
{ resource: "report", action: "schedule" }
],
isActive: false,
createdAt: new Date(),
updatedAt: new Date()
},
{
_id: ids.dashboardMfe,
serviceName: "Dashboard",
serviceIdentifier: "dashboard-mfe",
description: "Main dashboard UI.",
serviceType: "microfrontend",
baseUrl: "https://app.example.com/dashboard",
exposedPermissions: [
{ resource: "dashboard", action: "view" },
{ resource: "widget", action: "customize" }
],
isActive: true,
createdAt: new Date(),
updatedAt: new Date()
},
{
_id: ids.adminMfe,
serviceName: "Admin Panel",
serviceIdentifier: "admin-mfe",
description: "Admin interface.",
serviceType: "microfrontend",
baseUrl: "https://admin.example.com",
exposedPermissions: [
{ resource: "admin-panel", action: "access" },
{ resource: "config", action: "read" },
{ resource: "config", action: "update" },
{ resource: "audit-log", action: "read" }
],
isActive: true,
createdAt: new Date(),
updatedAt: new Date()
},
{
_id: ids.analyticsMfe,
serviceName: "Analytics",
serviceIdentifier: "analytics-mfe",
description: "Analytics dashboard.",
serviceType: "microfrontend",
baseUrl: "https://app.example.com/analytics",
exposedPermissions: [
{ resource: "analytics", action: "view" },
{ resource: "analytics", action: "export" },
{ resource: "funnel", action: "build" }
],
isActive: true,
createdAt: new Date(),
updatedAt: new Date()
}
])

db.roles.insertMany([
{
name: "super-admin",
allowedServices: [
{ serviceId: ids.authSvc, actions: ["session:create","session:revoke","token:refresh","mfa:enable","mfa:disable"] },
{ serviceId: ids.userSvc, actions: ["user:read","user:create","user:update","user:delete","user:list"] },
{ serviceId: ids.billingSvc, actions: ["invoice:read","invoice:create","subscription:read","subscription:update","subscription:cancel","payment:refund"] }
],
isTemp: false,
createdAt: new Date(),
updatedAt: new Date()
},
{
name: "user",
allowedServices: [
{ serviceId: ids.userSvc, actions: ["user:read","user:update"] },
{ serviceId: ids.dashboardMfe, actions: ["dashboard:view"] }
],
isTemp: false,
createdAt: new Date(),
updatedAt: new Date()
},
{
name: "guest",
allowedServices: [
{ serviceId: ids.dashboardMfe, actions: ["dashboard:view"] }
],
isTemp: false,
createdAt: new Date(),
updatedAt: new Date()
}
])

print("Seed complete")