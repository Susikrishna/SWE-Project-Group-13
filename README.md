# Role & Permission Management

## Overview
This project implements a Role-Based Access Control (RBAC) system with microfrontend architecture and backend APIs for Role creation and Registry Management.

---

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB

---

## Setup and Running Instructions

### Authorization Engine

**Install dependencies:**
```bash
cd SWE-Project-Group-13/backend/services/auz-engine
npm install
```

**Create a `.env` file:**
```env
PORT=
MONGO_DB_URI=
JWT_SECRET=
```

**Run the engine:**
```bash
npm run dev
```

---

### Registry Management

#### Backend

**Install dependencies:**
```bash
cd SWE-Project-Group-13/backend/services/registry-service
npm install
```

**Create a `.env` file:**
```env
PORT=
MONGO_DB_URI=
```

**Run the backend server:**
```bash
npm run dev
```

#### Frontend

**Install dependencies:**
```bash
cd SWE-Project-Group-13/frontend/Admin-Registry-Management
npm install
```

**Create a `.env` file:**
> `VITE_REGISTRY_URL` is the URL for the Registry Management backend server.
```env
VITE_REGISTRY_URL=
```

**Run the frontend server:**
```bash
npm run dev
```

---

### Role Creation

#### Backend

**Install dependencies:**
```bash
cd SWE-Project-Group-13/backend/services/role-service
npm install
```

**Create a `.env` file:**
```env
PORT=
MONGO_DB_URI=
```

**Run the backend server:**
```bash
npm run dev
```

#### Frontend

**Install dependencies:**
```bash
cd SWE-Project-Group-13/frontend/Admin-Role-Creation
npm install
```

**Create a `.env` file:**
> `VITE_SERVER_URL` is the URL for the Role Creation backend server.  
> `VITE_REGISTRY_URL` is the URL for the Registry Management backend server.
```env
VITE_SERVER_URL=
VITE_REGISTRY_URL=
```

**Run the frontend server:**
```bash
npm run dev
```