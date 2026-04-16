# SWE Group 13 — RBAC Microfrontend Platform

A **Role-Based Access Control (RBAC)** system built with a **microfrontend (MFE)** architecture and independent **backend microservices**. Admins can manage roles and a service registry through separate, independently deployable apps.

---

## Architecture Overview

```
Project/
├── backend/
│   └── services/
│       ├── auz-engine/          # Auth & JWT issuing (port 3000)
│       ├── registry-service/    # API & MFE registry (port 5001)
│       ├── role-service/        # Role CRUD (port 3002)
│       └── user-service/        # User management (port 3003)
└── frontend/
    ├── Admin-Registry-Management/   # Vite + React MFE (port 5002)
    └── Admin-Role-Creation/         # Vite + React MFE (port 5173)
```

Each backend service runs independently with its own Express server, MongoDB connection, and `.env` file. The two Vite frontends communicate with the backends via environment-configured URLs.

---

## Port Reference

| Service | Type | Default Port |
|---|---|---|
| `auz-engine` | Backend | `3000` |
| `registry-service` | Backend | `5001` |
| `role-service` | Backend | `3002` |
| `user-service` | Backend | `3003` |
| `Admin-Registry-Management` | Frontend (Vite) | `5002` |
| `Admin-Role-Creation` | Frontend (Vite) | `5173` |

---

## Environment Variables

Each service has its own `.env` file. **Never commit `.env` files** — they are git-ignored at the root. Use the `.env.example` in each directory as the template.

### Where the `.env` files live

```
backend/services/auz-engine/.env          ← copy from .env.example
backend/services/registry-service/.env   ← copy from .env.example
backend/services/role-service/.env      ← copy from .env.example 
backend/services/user-service/.env       ← copy from .env.example
frontend/Admin-Registry-Management/.env  ← copy from .env.example
frontend/Admin-Role-Creation/.env        ← copy from .env.example
```

### Variable reference

| Variable | Used in | Description |
|---|---|---|
| `PORT` | All backends | Port the service listens on |
| `MONGO_DB_URI` | `auz-engine`, `registry-service`, `role-service`, `user-service` | MongoDB Atlas connection string |
| `JWT_SECRET` | `auz-engine`, `registry-service` | Secret for signing/verifying JWTs — **must match across both** |
| `VITE_SERVER_URL` | Both frontends | URL of the backend service the frontend posts to |
| `VITE_REGISTRY_URL` | Both frontends | URL of the registry service |

> ⚠️ `JWT_SECRET` must be identical in `auz-engine` and `registry-service`. If they differ, token verification will fail.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A MongoDB Atlas cluster (or local MongoDB instance)

---

### 1. Clone & set up environment files

```bash
git clone <repo-url>
cd SWE-Project-Group-13
```

For each service, copy the example file and fill in your values:

```bash
# Backend services
cp backend/services/auz-engine/.env.example       backend/services/auz-engine/.env
cp backend/services/registry-service/.env.example backend/services/registry-service/.env
cp backend/services/role-service/.env.example     backend/services/role-service/.env
cp backend/services/user-service/.env.example     backend/services/user-service/.env

# Frontends
cp frontend/Admin-Registry-Management/.env.example frontend/Admin-Registry-Management/.env
cp frontend/Admin-Role-Creation/.env.example       frontend/Admin-Role-Creation/.env
```

---

### 2. Auth Engine (`auz-engine`)

```bash
cd backend/services/auz-engine
npm install
npm run dev
```

`.env` variables needed:

```env
PORT=3000
MONGO_DB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
JWT_SECRET=your_shared_secret
```

---

### 3. Registry Service

```bash
cd backend/services/registry-service
npm install
npm run dev
```

`.env` variables needed:

```env
PORT=5001
MONGO_DB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
JWT_SECRET=your_shared_secret   # must match auz-engine
```

---

### 4. Role Service

```bash
cd backend/services/role-service
npm install
npm run dev
```

`.env` variables needed:

```env
PORT=3002
MONGO_DB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
```

---

### 5. User Service

```bash
cd backend/services/user-service
npm install
npm run dev
```

`.env` variables needed:

```env
PORT=3003
MONGO_DB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
```

---

### 6. Admin Registry Management (Frontend)

```bash
cd frontend/Admin-Registry-Management
npm install
npm run dev
```

`.env` variables needed:

```env
VITE_SERVER_URL=http://localhost:5002
VITE_REGISTRY_URL=http://localhost:5001
```

---

### 7. Admin Role Creation (Frontend)

```bash
cd frontend/Admin-Role-Creation
npm install
npm run dev
```

`.env` variables needed:

```env
VITE_SERVER_URL=http://localhost:3002
VITE_REGISTRY_URL=http://localhost:5001
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Module Federation |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (`jsonwebtoken`) |
| Dev tooling | Nodemon, ESLint |
