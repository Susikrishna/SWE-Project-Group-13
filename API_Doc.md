# API Documentation

## Overview
The application consists of multiple backend services: User Service, Registry Service, Role Service, and Authorization Engine (Auz-Engine). Each service exposes RESTful endpoints for managing users, roles, permissions, API registries, microfrontends, and authorization checks.

## Services

### 1. User Service (Port 3003)

**Base URL:** `/user`

This service manages user accounts, including creation, role assignment, and attribute updates for Attribute-Based Access Control (ABAC).

#### Endpoints

- **GET /user**
  - **Purpose:** Gets all users from the database, sorted by creation date in descending order (newest first).
  - **Response:** JSON array of users with total count.

- **POST /user**
  - **Purpose:** Creates a new user account. Requires name, username, password, and roles. Password is hashed before storage. Optional attributes for ABAC.
  - **Body:** `{ name, username, password, roles, attributes }`
  - **Response:** Created user object.

- **POST /user/addRole**
  - **Purpose:** Adds one or more roles to an existing user. Validates that each role exists in the Role Service.
  - **Body:** `{ username, roleArr }`
  - **Response:** Updated user object.

- **PUT /user/attributes**
  - **Purpose:** Updates ABAC attributes for a user. Supports attributes like department, clearance, location, employeeType, and customTags.
  - **Body:** `{ username, attributes }`
  - **Response:** Success message and updated user.

- **DELETE /user/clearAll**
  - **Purpose:** Removes all roles from all users in the system.
  - **Response:** Success message.

- **DELETE /user/clear**
  - **Purpose:** Removes specific roles from a user. Validates that roles exist and user has them.
  - **Body:** `{ username, roleArr }`
  - **Response:** Success message and updated user.

### 2. Registry Service (Port 3001)

**Base URL:** `/registry`

This service maintains registries for APIs, Microfrontends (MFEs), and Permission Sets, enabling centralized management of system resources and permissions.

#### API Registry (`/registry/services`)

Manages registration of API endpoints for RBAC permission generation.

- **POST /registry/services**
  - **Purpose:** Registers a single API endpoint, generating a standardized RBAC permission key (e.g., 'service:resource:action').
  - **Body:** `{ service, basePath, route, method, description, resource, action, isPublic, isActive }`
  - **Response:** Registered API object.

- **GET /registry/services**
  - **Purpose:** Gets all registered APIs, sorted by creation date descending.
  - **Response:** JSON array of APIs.

- **GET /registry/services/search?q=query**
  - **Purpose:** Searches APIs across multiple fields (service, basePath, route, method, permissionKey, description, resource). Returns top 10 matches.
  - **Query Params:** `q` (search string)
  - **Response:** JSON array of matching APIs.

- **POST /registry/services/bulk**
  - **Purpose:** Bulk registers multiple API endpoints for a service. Skips duplicates automatically.
  - **Body:** `{ service, basePath, apis }` where `apis` is an array of API objects.
  - **Response:** Insertion results with counts.

- **PUT /registry/services/:id**
  - **Purpose:** Updates an existing API registry entry. Restricted to safe fields to prevent breaking RBAC.
  - **Body:** `{ basePath, route, method, description, isPublic, isActive }`
  - **Response:** Updated API object.

#### MFE Registry (`/registry/mfes`)

Manages registration of Microfrontends for role-based UI access.

- **POST /registry/mfes**
  - **Purpose:** Registers a new Microfrontend (MFE) with feature slug, name, route, remote URL, module, and allowed permissions.
  - **Body:** `{ feature, name, description, route, comps, remoteUrl, module, isActive, allowedPermissions }`
  - **Response:** Registered MFE object.

- **GET /registry/mfes**
  - **Purpose:** Gets all registered MFEs, sorted by creation date descending.
  - **Response:** JSON array of MFEs.

- **PUT /registry/mfes/:id**
  - **Purpose:** Updates an existing MFE registry entry. Restricted to safe fields.
  - **Body:** `{ name, description, route, remoteUrl, module, isActive }`
  - **Response:** Updated MFE object.

- **GET /registry/mfes/search?q=query**
  - **Purpose:** Searches MFEs across multiple fields (name, feature, route, module, description). Returns top 10 matches.
  - **Query Params:** `q` (search string)
  - **Response:** JSON array of matching MFEs.

#### Permission Set Registry (`/registry/permission-sets`)

Manages permission sets that group MFEs for role assignment.

- **POST /registry/permission-sets**
  - **Purpose:** Creates a new permission set with name, description, associated MFEs, and active status. Validates MFE existence.
  - **Body:** `{ name, description, mfes, isActive }`
  - **Response:** Created permission set with populated MFE details.

- **GET /registry/permission-sets**
  - **Purpose:** Gets all permission sets, optionally filtered by IDs. Populates MFE references.
  - **Query Params:** `ids` (comma-separated list of IDs)
  - **Response:** JSON array of permission sets.

- **PUT /registry/permission-sets/:id**
  - **Purpose:** Updates an existing permission set, including MFE associations. Validates MFE existence.
  - **Body:** `{ name, description, mfes, isActive }`
  - **Response:** Updated permission set.

- **DELETE /registry/permission-sets/:id**
  - **Purpose:** Deletes a permission set by ID.
  - **Response:** Success message.

### 3. Role Service (Port 3002)

**Base URL:** `/roles`

This service manages roles, including creation, editing, and deletion, with support for permission sets and ABAC policies.

#### Endpoints

- **GET /roles**
  - **Purpose:** Gets all roles from the database, sorted by creation date descending.
  - **Response:** JSON array of roles.

- **GET /roles/:id**
  - **Purpose:** Gets a specific role by its ID.
  - **Response:** Role object or 404 if not found.

- **POST /roles**
  - **Purpose:** Creates a new role with name, description, permission sets, temporary status, expiration, and ABAC policies. Validates ABAC policy structure.
  - **Body:** `{ name, description, permissionSets, isTemp, expiresAt, abacPolicies }`
  - **Response:** Created role object.

- **PUT /roles**
  - **Purpose:** Edits an existing role by ID. Updates fields like name, description, permission sets, and ABAC policies. Validates ABAC structure.
  - **Body:** `{ roleId, name, description, permissionSets, isTemp, expiresAt, abacPolicies }`
  - **Response:** Updated role object.

- **DELETE /roles**
  - **Purpose:** Deletes a single role by ID.
  - **Body:** `{ roleId }`
  - **Response:** Success message.

- **DELETE /roles/del**
  - **Purpose:** Deletes multiple roles by their IDs.
  - **Body:** `{ roleIds }` (array)
  - **Response:** Success message with deletion count.

### 4. Authorization Engine (Auz-Engine) (Port 4000)

**Base URL:** `/auth` and `/log`

This service handles authorization checks (RBAC and ABAC), access profile loading, and logging/auditing of authorization decisions.

#### Auth Routes (`/auth`)

- **GET /auth/authorize**
  - **Purpose:** Gets the full authorization profile for the authenticated user, including user ID, role summaries, and allowed microfrontends. Used by frontend/gateway on login.
  - **Auth:** Requires valid JWT token.
  - **Response:** `{ userId, role, roles, microfrontends }`

- **POST /auth/check-access**
  - **Purpose:** Performs a hybrid RBAC/ABAC access check. Can resolve permission from URL/method or use direct permission key. Optional ABAC policy evaluation.
  - **Auth:** Requires valid JWT token.
  - **Body:** `{ permissionKey, policy, context, url, method }`
  - **Response:** Access decision with reasons.

#### Log Routes (`/log`)

- **GET /log**
  - **Purpose:** Gets all authorization logs, optionally filtered by date range.
  - **Query Params:** `from`, `to` (ISO date strings)
  - **Response:** JSON array of logs.

- **GET /log/:userId**
  - **Purpose:** Gets authorization logs for a specific user, optionally filtered by date range.
  - **Query Params:** `from`, `to` (ISO date strings)
  - **Response:** JSON array of user logs.

- **GET /log/analytics**
  - **Purpose:** Provides comprehensive analytics on authorization logs, including API frequency, decision breakdown (ALLOW/DENY), traffic over time, average response times, status code distribution, role activity, and top users.
  - **Query Params:** `from`, `to` (ISO date strings)
  - **Response:** Analytics data object.

## Authentication and Authorization

- Endpoints require JWT token authentication.
- Authorization uses a combination of Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC).
- The Authorization Engine resolves permissions from API registry and evaluates according to policies.

## Data Models

- **Users:** Include roles and ABAC attributes.
- **Roles:** Contain permission sets and ABAC policies.
- **APIs:** Registered endpoints with generated permission keys.
- **MFEs:** Microfrontends with access controls.
- **Permission Sets:** Groups of MFEs for roles.
- **Logs:** Audit trail of authorization decisions.

This documentation covers all REST API endpoints across the services. For implementation details, refer to the source code in each service's `controllers/` and `routes/` directories.</content>
<parameter name="filePath">/Users/lakshsidhu/SWE_Project/SWE-Project-Group-13/API_DOCUMENTATION.md