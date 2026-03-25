# Project Overview & Architecture setup

This project implements a Role-Based Access Control (RBAC) system with a **microfrontend (MFE)** architecture and independent **backend microservices** for Role creation and Registry Management.

---

## Architecture: Hybrid Environment Approach

To support both seamless local development and decoupled microservices, this monorepo utilizes a **Hybrid `.env` Architecture**:

1. **Root `.env` (Global):** Contains strictly shared infrastructure variables like database URLs and global secret keys.
2. **Service `.env` (Local):** Located inside each specific microservice or microfrontend folder. Contains service-specific properties (e.g., specific `PORT`s for backends, or `VITE_` API URLs for frontends).

> **Important:** When starting a backend server, Node will automatically cascade the root `.env` first, and then apply the local `.env` variables securely.

---

## Setup Instructions

### 1. Global Setup
At the root of the project `SWE-Project-Group-13`, duplicate the `.env.example` file and rename it to `.env`. Ensure your global secrets are set:
```env
MONGO_DB_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
```

### 2. Authorization Engine (Backend)
**Location:** `/backend/services/auz-engine`
1. Install dependencies: `npm install`
2. Create/Verify its local `.env`:
   ```env
   PORT=3000
   ```
3. Run: `npm run dev`

### 3. Registry Management (Backend & Frontend)
**Backend Location:** `/backend/services/registry-service`
1. Install dependencies: `npm install`
2. Create/Verify its local `.env`:
   ```env
   PORT=3001
   ```
3. Run: `npm run dev`

**Frontend Location:** `/frontend/Admin-Registry-Management`
1. Install dependencies: `npm install`
2. Create/Verify its local `.env`:
   ```env
   VITE_REGISTRY_URL=http://localhost:3001
   ```
3. Run: `npm run dev`

### 4. Role Creation (Backend & Frontend)
**Backend Location:** `/backend/services/role-service`
1. Install dependencies: `npm install`
2. Create/Verify its local `.env`:
   ```env
   PORT=3002
   ```
3. Run: `npm run dev`

**Frontend Location:** `/frontend/Admin-Role-Creation`
1. Install dependencies: `npm install`
2. Create/Verify its local `.env`:
   ```env
   VITE_SERVER_URL=http://localhost:3002
   VITE_REGISTRY_URL=http://localhost:3001
   ```
3. Run: `npm run dev`