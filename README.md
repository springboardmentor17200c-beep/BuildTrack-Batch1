# BuildTrack — Full Stack Construction Management Platform

BuildTrack is a construction project management and site monitoring platform built with **Angular 18** on the frontend and **FastAPI + PostgreSQL** on the backend.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup (FastAPI + PostgreSQL)](#2-backend-setup-fastapi--postgresql)
  - [3. Frontend Setup (Angular 18)](#3-frontend-setup-angular-18)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Role-Based Access Control](#role-based-access-control)
- [Modules Overview](#modules-overview)
- [Viewing Data in PostgreSQL](#viewing-data-in-postgresql)
- [Known Issues & Fixes Applied](#known-issues--fixes-applied)
- [Test Accounts](#test-accounts)
- [API Documentation](#api-documentation)

---

## Project Overview

BuildTrack is a full-stack web platform for construction project management. It supports:

- User Registration, Login & Role-Based Dashboards
- Project Management (milestones, statuses, timelines)
- Resource Management (equipment, allocation, utilization)
- Inventory Management (materials, stock, requests)
- Workforce Management (employees, attendance, shifts)
- Analytics & Reporting (budget, progress, procurement)

---

## Tech Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | Angular 18, TypeScript, Vanilla CSS          |
| Backend    | FastAPI (Python 3.12)                        |
| Database   | PostgreSQL 18                                |
| ORM        | SQLAlchemy 2.x                               |
| Auth       | OAuth2 + JWT (via python-jose)               |
| Password   | bcrypt (direct library, Python 3.12-safe)    |

---

## Project Structure

```
BuildTrack-Batch1/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # App settings from .env
│   │   │   ├── security.py        # bcrypt password hashing & JWT tokens
│   │   │   └── dependencies.py    # FastAPI dependency injection
│   │   ├── db/
│   │   │   ├── database.py        # PostgreSQL engine + session
│   │   │   └── init_db.py         # Auto-creates schema + tables on startup
│   │   ├── models/
│   │   │   ├── __init__.py        # Imports all models for SQLAlchemy
│   │   │   ├── user.py
│   │   │   ├── role.py
│   │   │   ├── company.py
│   │   │   ├── project.py
│   │   │   ├── project_milestone.py
│   │   │   ├── inventory.py
│   │   │   ├── resource.py
│   │   │   ├── workforce.py
│   │   │   └── report.py
│   │   ├── routes/
│   │   │   ├── auth.py            # /auth/register, /auth/login, /auth/me
│   │   │   ├── company.py
│   │   │   ├── project.py
│   │   │   ├── project_milestone.py
│   │   │   └── report.py
│   │   ├── schemas/
│   │   │   ├── auth.py            # RegisterRequest, Token, ChangePasswordRequest
│   │   │   └── user.py            # UserResponse, UserUpdate
│   │   └── main.py                # FastAPI app + CORS + startup DB init
│   ├── .env                       # Environment variables (DO NOT COMMIT)
│   └── requirements.txt
│
└── frontend/
    └── buildtrack-frontend/
        └── src/
            └── app/
                ├── app.config.ts              # Angular providers (HTTP + Router)
                ├── app.routes.ts              # Top-level routes
                ├── features/
                │   ├── auth/                  # AuthDataService, guards, models
                │   ├── login/                 # Sign-in page
                │   ├── register/              # Sign-up page
                │   ├── dashboards/            # 5 role-specific dashboards
                │   ├── projects/
                │   ├── resource-management/
                │   ├── inventory/
                │   ├── workforce/
                │   └── analytics/
                └── environments/
                    └── environment.ts         # apiUrl: 'http://localhost:8000'
```

---

## Prerequisites

Make sure the following are installed on your machine:

| Requirement        | Version     |
|--------------------|-------------|
| Python             | 3.12+       |
| Node.js            | 18+ or 20+  |
| Angular CLI        | 18+         |
| PostgreSQL         | 16, 17, or 18 |
| Git                | Any         |

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BuildTrack-Batch1
```

---

### 2. Backend Setup (FastAPI + PostgreSQL)

#### Step 1 — Navigate to the backend folder

```bash
cd backend
```

#### Step 2 — Create and activate a virtual environment

**Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv .venv
.venv\Scripts\activate
```

**Linux / macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### Step 3 — Install Python dependencies

```bash
pip install -r requirements.txt
```

#### Step 4 — Configure the `.env` file

Create or edit `backend/.env` with the following contents:

```env
SECRET_KEY=super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OTP_EXPIRATION_MINUTES=5
SENDGRID_API_KEY=placeholder
MAIL_FROM_EMAIL=noreply@buildtrack.dev
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:YOUR_PORT/buildtrack_db
```

> **Important notes:**
> - Replace `YOUR_PASSWORD` with your actual PostgreSQL password.
> - Replace `YOUR_PORT` with the port PostgreSQL is running on. Default is `5432`. Some installations (especially PostgreSQL 18) may use `5433`.
> - If your password contains special characters (like `@`), the backend automatically URL-encodes them — just write them as-is in the `.env` file.

**Example for PostgreSQL 18 on Windows:**
```env
DATABASE_URL=postgresql://postgres:Ajaz@2004@localhost:5433/buildtrack_db
```

#### Step 5 — Start the Backend

The backend automatically creates the PostgreSQL database, the `buildtrack` schema, and all tables on first startup.

```bash
python -m uvicorn app.main:app --reload --port 8000
```

You should see:
```text
Database schema and tables initialized successfully!
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

### 3. Frontend Setup (Angular 18)

#### Step 1 — Navigate to the frontend folder

```bash
cd frontend/buildtrack-frontend
```

#### Step 2 — Install Node.js dependencies

```bash
npm install
```

#### Step 3 — Start the Angular development server

```bash
ng serve
```

The Angular app will be available at: **`http://localhost:4200`**

---

## Environment Configuration

### Backend — `backend/.env`

| Variable                    | Description                            | Default                  |
|-----------------------------|----------------------------------------|--------------------------|
| `SECRET_KEY`                | JWT signing secret                     | `super-secret-key`       |
| `ALGORITHM`                 | JWT algorithm                          | `HS256`                  |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token lifespan                   | `30`                     |
| `DATABASE_URL`              | Full PostgreSQL connection string      | *(must be set manually)* |

### Frontend — `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000'
};
```

---

## Database Setup

The database is **automatically initialized** when the backend starts. You do **not** need to run any SQL scripts manually. On every server startup:

1. The backend connects to PostgreSQL.
2. If the `buildtrack_db` database does not exist, it creates it.
3. If the `buildtrack` schema does not exist, it creates it.
4. All tables (`users`, `roles`, `companies`, `projects`, `reports`, etc.) are created if they do not already exist.

### Checking What Port PostgreSQL is Running On

Open PowerShell and run:
```powershell
netstat -ano | Select-String "5432"
netstat -ano | Select-String "5433"
```
Whichever port shows an active connection is the one PostgreSQL is listening on. Use that port in your `DATABASE_URL`.

---

## Running the Application

### Start both servers simultaneously (2 terminals):

**Terminal 1 — Backend:**
```bash
cd BuildTrack-Batch1/backend
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd BuildTrack-Batch1/frontend/buildtrack-frontend
ng serve
```

Then open your browser and visit: **`http://localhost:4200`**

---

## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint             | Description                    | Auth Required |
|--------|----------------------|--------------------------------|---------------|
| POST   | `/auth/register`     | Create a new user account      | No            |
| POST   | `/auth/login`        | Sign in (returns JWT token)    | No            |
| GET    | `/auth/me`           | Get current user profile       | Yes (Bearer)  |
| PUT    | `/auth/me`           | Update profile info            | Yes (Bearer)  |
| PUT    | `/auth/change-password` | Change password             | Yes (Bearer)  |

### Reports (`/reports`)

| Method | Endpoint    | Description              | Auth Required |
|--------|-------------|--------------------------|---------------|
| GET    | `/reports`  | Fetch all reports        | No            |
| POST   | `/reports`  | Generate a new report    | No            |

### Companies (`/companies`)

| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| POST   | `/companies/register`       | Register a company    |
| GET    | `/companies`                | List all companies    |
| GET    | `/companies/{company_id}`   | Get company by ID     |

### Projects (`/projects`)

| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| POST   | `/projects`                 | Create project        |
| GET    | `/projects`                 | List all projects     |
| GET    | `/projects/{project_id}`    | Get project by ID     |
| PUT    | `/projects/{project_id}`    | Update project        |
| DELETE | `/projects/{project_id}`    | Delete project        |

---

## Authentication Flow

```
User fills Register form
        │
        ▼
POST /auth/register  →  Creates User + Role + Company in PostgreSQL
        │
        ▼
User fills Login form (email OR username, case-insensitive)
        │
        ▼
POST /auth/login  →  Verifies bcrypt password hash  →  Returns JWT token
        │
        ▼
GET /auth/me  →  Returns full user profile including role name
        │
        ▼
Angular routes user to role-specific dashboard
```

> **Login is flexible:** You can sign in with either your **email address** or your **full name** — both are accepted, case-insensitively.

---

## Role-Based Access Control

After login, users are automatically routed to the dashboard matching their role:

| Role              | Dashboard Route              |
|-------------------|------------------------------|
| Administrator     | `/dashboards/admin`          |
| Project Manager   | `/dashboards/project-manager`|
| Site Engineer     | `/dashboards/site-engineer`  |
| Contractor        | `/dashboards/contractor`     |
| Client / Owner    | `/dashboards/client`         |
| Worker            | `/dashboards/worker`         |

Module access by role:

| Module              | Administrator | Project Manager | Site Engineer | Contractor | Worker | Client |
|---------------------|:---:|:---:|:---:|:---:|:---:|:---:|
| Projects            | ✅  | ✅  | ✅  | ✅  | ❌  | ❌  |
| Resource Management | ✅  | ✅  | ✅  | ❌  | ❌  | ❌  |
| Inventory           | ✅  | ✅  | ✅  | ✅  | ❌  | ❌  |
| Workforce           | ✅  | ✅  | ✅  | ✅  | ❌  | ❌  |
| Analytics           | ✅  | ✅  | ❌  | ❌  | ❌  | ❌  |

---

## Modules Overview

| Module              | Status       | Backend Connected |
|---------------------|--------------|-------------------|
| Authentication      | ✅ Complete  | ✅ PostgreSQL     |
| Reports             | ✅ Complete  | ✅ PostgreSQL     |
| Projects            | ✅ Complete  | ⚙️ Mock data     |
| Resource Management | ✅ Complete  | ⚙️ Mock data     |
| Inventory           | ✅ Complete  | ⚙️ Mock data     |
| Workforce           | ✅ Complete  | ⚙️ Mock data     |
| Analytics           | ✅ Complete  | ⚙️ Mock data     |

---

## Viewing Data in PostgreSQL

### Option 1: pgAdmin 4 (GUI — Recommended)

1. Open **pgAdmin 4**
2. Connect to your server (host: `localhost`, port: `5433` or `5432`)
3. Navigate: **Databases → buildtrack_db → Schemas → buildtrack → Tables**
4. Right-click any table → **View/Edit Data → All Rows**

### Option 2: Quick Python Inspect

Run in your `backend/` folder (no server needed):

```bash
python -c "from app.db.database import SessionLocal; from app.models.user import User; db = SessionLocal(); [print(u.user_id, u.full_name, u.email) for u in db.query(User).all()]; db.close()"
```

### Option 3: psql Command Line

```bash
psql -h localhost -p 5433 -U postgres -d buildtrack_db
```

Then inside the psql shell:
```sql
SET search_path TO buildtrack;

SELECT user_id, full_name, email, created_at FROM users;
SELECT report_id, file_name, report_type, generated_at FROM reports;
SELECT company_id, company_name, company_email FROM companies;
```

---

## Known Issues & Fixes Applied

### Fix 1: PostgreSQL 18 uses port 5433 (not 5432)
PostgreSQL 18 on Windows may default to port `5433`. Detect it:
```powershell
netstat -ano | Select-String "5432"
netstat -ano | Select-String "5433"
```
Update your `DATABASE_URL` accordingly.

### Fix 2: bcrypt / passlib incompatibility on Python 3.12
The `passlib[bcrypt]` library has a known bug on Python 3.12+ where it raises `AttributeError: module 'bcrypt' has no attribute '__about__'`. The `security.py` was updated to use `bcrypt` directly:
```python
import bcrypt
bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')
bcrypt.checkpw(pwd_bytes, hashed.encode('utf-8'))
```

### Fix 3: Tables NOT NULL constraints after live alter
If PostgreSQL was initialized before `nullable=True` was set in Python models, existing columns may still have `NOT NULL`. Fix with:
```sql
ALTER TABLE buildtrack.users ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE buildtrack.users ALTER COLUMN role_id DROP NOT NULL;
```

### Fix 4: Angular HTTP Client warning
Added `withFetch()` to `provideHttpClient()` in `app.config.ts`:
```typescript
provideHttpClient(withFetch())
```

### Fix 5: API URL prefix mismatch
All auth endpoints use `/auth/` prefix. Frontend `AuthDataService` was updated to call:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

---

## Test Accounts

Register accounts directly from `http://localhost:4200/register`.

To create a test account via API directly:
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"first_name\":\"Test\",\"last_name\":\"Admin\",\"email\":\"admin@test.com\",\"password\":\"password123\",\"phone_number\":\"9876543210\",\"role\":\"Administrator\",\"company_name\":\"Test Corp\"}"
```

Then sign in at `http://localhost:4200/login` with your email and password.

---

## API Documentation

FastAPI automatically generates interactive API documentation:

| URL                              | Description              |
|----------------------------------|--------------------------|
| `http://localhost:8000/docs`     | Swagger UI (try it live) |
| `http://localhost:8000/redoc`    | ReDoc (clean reference)  |

---

## Branch: `test/malik`

This branch (`test/malik`) contains the following changes on top of the `project` branch:

- ✅ PostgreSQL 18 database integration (auto-creates schema + tables on startup)
- ✅ bcrypt password hashing rewritten for Python 3.12 compatibility
- ✅ Registration endpoint supports `first_name`/`last_name`/`role`/`company_name` (no pre-existing IDs needed)
- ✅ Login accepts email OR username, case-insensitively
- ✅ `company_id` and `role_id` auto-resolved from names; new roles/companies created automatically if they don't exist
- ✅ `/auth/me` returns role name string (not just role_id), enabling dashboard routing
- ✅ Angular `provideHttpClient(withFetch())` fix
- ✅ All API URLs corrected to use `/auth/` prefix
- ✅ Report generation connected to PostgreSQL

---

*Last updated: August 2026 — `test/malik` branch*
