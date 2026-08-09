 HEAD
# BuildTrack Frontend — What I Built

This document covers everything I added to the frontend during this internship, from the first Resource Management screen all the way through to hooking Login/Register up to the real backend. I'm writing this mostly so future-me (or whoever picks this up next) doesn't have to reverse-engineer any of it from the code alone.

## Quick summary

BuildTrack is a construction project management platform. My part of the project was the Angular frontend — I ended up building six full modules (Projects, Resource Management, Inventory, Workforce, Analytics, and Authentication/Dashboards), a shared design system so all of it looks like one product instead of six different ones, role-based access control, and the first working connection to the real FastAPI backend.

Everything runs on Angular with standalone components (no NgModules), all mock data for now except Login/Register/Password Reset, which talk to the actual backend.

## How the whole thing fits together

```
src/app/features/
  login/               sign in
  register/            create account
  reset-password/      OTP-based password reset
  profile/             edit your own account, change password
  unauthorized/         "you don't have access to this" screen
  auth/                 shared auth service, models, and route guards
  dashboards/           5 role-specific dashboards (Admin, PM, Site Engineer, Contractor, Client)
  projects/             project listing, details, milestones, status
  resource-management/  equipment allocation, tracking, utilization
  inventory/            material stock, requests, dashboard
  workforce/            worker records, attendance, shift scheduling
  analytics/            budget/progress/resource/procurement analytics
  shared/
    bt-theme.css         one shared stylesheet used by every module above
    sidebar/             the persistent nav sidebar shown on every dashboard
```

Every module follows roughly the same shape: a "hub" screen with a few clickable cards, and 3–4 connected pages underneath it. The exception is Projects, where clicking into a specific project takes you to a dynamic details page (`/projects/detail/:id`) rather than a fixed page, since each project obviously has different data.

## The design system

Early on I was building each module's styling from scratch, which meant every page looked slightly different depending on when I built it. At some point my teammate built the actual "Project Management" listing page with a specific look — rounded cards, solid-color icon squares, pill-shaped status badges, progress bars, a search/filter/add bar at the top — and I rebuilt everything else to match it exactly, then pulled all of that into one file: `features/shared/bt-theme.css`.

Every module now uses the same set of CSS classes (`bt-page`, `bt-stat-card`, `bt-badge`, `bt-table`, `bt-progress`, `bt-add-btn`, etc.) instead of writing new CSS per page. If we ever want to change the color palette or spacing, it happens once in that file and every module updates together.

Colors: blue `#3b82f6`, green `#10b981`, purple `#8b5cf6`, orange `#f97316`, red `#ef4444`.

## Authentication

Three screens — Login, Register, Password Reset — plus Profile Management and a proper Unauthorized page. All three of the main ones are wired to the real backend now (see the "backend connection" section below).

A few things worth knowing:
- Login uses **username**, not email — that's how the backend's `/login` endpoint is actually built (OAuth2 form field, not JSON).
- Password reset is a two-step flow in the UI (enter email → enter OTP + new password), but it's actually three API calls underneath (`forgot-password` → `verify-otp` → `reset-password`) chained together so it doesn't feel like extra steps to the user.
- Registration collects username, first name, last name, email, phone, role, and password, plus a couple of role-specific fields (company name/tax ID for Contractors and Clients, employee ID/skills for Workers and Site Engineers) that only show up depending on which role you pick.

## Role-based access control

Every route that isn't Login/Register/Reset is protected by one of two guards:

- `authGuard` — just checks someone is logged in
- `roleGuard('moduleName')` — checks the logged-in user's role is on the allow-list for that specific module

The allow-list lives in one place: `MODULE_ACCESS` inside `auth.model.ts`. Right now it's set up like this (this was my judgment call based on how the SRS describes each role, not something explicitly spelled out anywhere, so it's worth double-checking with the rest of the team):

| Module | Who can access it |
|---|---|
| Projects | Administrator, Project Manager, Site Engineer, Contractor |
| Resource Management | Administrator, Project Manager, Site Engineer |
| Inventory | Administrator, Project Manager, Site Engineer, Contractor |
| Workforce | Administrator, Project Manager, Site Engineer, Contractor |
| Analytics | Administrator, Project Manager |

Workers and Clients can't get into any of the management modules right now — they only have their dashboard, profile, and (for Clients) a simplified read-only project view.

If a guard blocks someone, they land on a real "Access restricted" screen (`/unauthorized`) that tells them which role they're logged in as and why they can't see the page, with a button back to their own dashboard.

## The 5 dashboards

The SRS calls for 5 different dashboard wireframes (Administrator, Project Manager, Site Engineer, Contractor, Client), and each one shows genuinely different information relevant to that role rather than being the same screen with a different title:

- **Admin** — company-wide: user counts by role, project monitoring, quick links into every analytics page, an activity feed
- **Project Manager** — their projects, budget %, workforce status, resource utilization, procurement overview, all on one screen
- **Site Engineer** — equipment status, stock alerts, today's attendance
- **Contractor** — their crew, shift schedule, equipment allocated to them, their own material requests
- **Client** — deliberately simpler. Just overall project status and progress, in plain language, with no cost-category breakdown — a client shouldn't be able to see internal spend splits between labor and materials

After logging in, you get routed straight to the dashboard matching your role automatically. There's also a sidebar on every dashboard listing all the modules — the ones your role can't access show up dimmed with a lock icon, but they're still clickable, so clicking one actually demonstrates the Unauthorized screen rather than just hiding the option.

## Projects

This is the one place where I rebuilt something that already existed — my teammate had built a single "Projects" listing page early on (it's actually the page the whole design system is based on). I rebuilt it into the same hub-plus-pages pattern as everything else: a hub screen, the project listing, milestone tracking across all projects, a status dashboard, and a per-project details page you reach by clicking into a specific project.

Progress percentage isn't a field stored anywhere — it's calculated from how many of a project's milestones are marked complete versus the total, the same way I'd expect the real backend to calculate it.

## Resource Management, Inventory, Workforce, Analytics

These four went through a second pass partway through the project once I actually got the database schema document from the team. Originally I'd built them with made-up field names and workflows that seemed reasonable, but they didn't line up with the real Postgres schema. A few real corrections came out of that:

- Resource allocations don't get deleted anymore — they get marked "Returned," matching the schema's whole philosophy around never editing away history for audit purposes.
- Inventory's third page used to be called "Procurement Requests" and had a "Delivered" status, but that's not actually what the schema has. It's really `material_requests` — a project asking to draw from existing stock — which is a different thing from real vendor procurement (`purchase_orders`, `invoices`), which doesn't have a screen yet. I renamed it to "Material Requests" and fixed the logic: approving a request now correctly **reduces** stock (it's going out to a project), which was backwards in my first version.
- Utilization percentage, assigned project, and last/next maintenance date aren't stored fields on a resource — they're computed from allocation and maintenance history, same as a real backend aggregate query would do it.

One real gap I couldn't fix from the frontend: **Workforce's Attendance Tracking and Shift Scheduling pages have no backend tables to save to.** The database schema document says this outright — only `employee_profiles` exists, nothing for attendance events or shift assignments. Those two pages work fine as a demo but there's nowhere for the data to actually persist until someone adds those tables.

## Connecting to the real backend

My teammate built the backend in FastAPI. So far only the auth routes exist (`login`, `register`, `forgot-password`, `verify-otp`, `reset-password`, `users/me`), so that's the only part actually talking to a real server right now — everything else (Projects, Resources, Inventory, Workforce, Analytics) is still running on mock arrays sitting in each module's `*-data.service.ts` file.

Going through the actual backend code turned up two real bugs that needed fixing before login would work at all:

1. **No CORS configuration.** The browser blocks any request from the Angular dev server to the FastAPI server unless CORS is explicitly allowed. Fixed by adding `CORSMiddleware` to `main.py`.
2. **`/users/me` didn't return the user's role, and crashed for anyone who'd actually registered.** It was reading a `full_name` key that `/register` never sets (the backend stores `first_name`/`last_name` separately). Since the whole dashboard-routing system depends on knowing someone's role right after they log in, this was a real blocker, not a nice-to-have. Fixed the endpoint to return the full profile including role.

The frontend code is written so it won't crash even if those fixes hadn't landed yet — it just falls back to a generic dashboard instead of a role-specific one. But it needed those two fixes to actually work correctly.

Every mock data service has comments showing exactly which real endpoint it's meant to call once that part of the backend exists (`GET /api/resources`, `GET /api/inventory/materials`, and so on), so wiring the rest up later should mostly be swapping arrays for HTTP calls rather than rewriting the components.

## Known gaps, in case someone picks this up

- Workforce Attendance and Shift Scheduling need real database tables before they can do anything beyond demo on mock data.
- Real vendor Procurement (purchase orders, invoices, vendor selection) isn't built as a screen at all yet — it's a separate module from Material Requests.
- The `MODULE_ACCESS` role permissions are my best guess based on the SRS, not confirmed with the team.
- Resources/Inventory/Workforce/Analytics/Projects are still mock data — only auth talks to the real backend so far.
- Payroll Monitoring (listed as a Workforce feature in the SRS) isn't represented anywhere yet, frontend or backend.

## Test accounts

Since there's no real seeded database yet, there are 6 mock accounts hardcoded in `auth-data.service.ts` for testing all 5 dashboards. Password is `password123` for all of them:

| Email | Role |
|---|---|
| arjun.rao@buildtrack.com | Administrator |
| priya.menon@buildtrack.com | Project Manager |
| karthik.iyer@buildtrack.com | Site Engineer |
| suresh.contractor@buildtrack.com | Contractor |
| rohan.client@buildtrack.com | Client / Owner |
| mohan.worker@buildtrack.com | Worker |

These reset automatically on a page refresh since they're just an in-memory array, not a real database — nothing needs manual cleanup.

## Running it

```
ng serve
```

For the parts actually connected to the backend, the FastAPI server needs to be running too:
```
uvicorn main:app --reload
```
=======
# Backend Architecture

## Overview

The BuildTrack backend serves as the central component of the application, responsible for handling client requests, implementing business logic, managing authentication and authorization, interacting with the PostgreSQL database, and exposing RESTful APIs to the frontend.

The backend is built using **FastAPI**, a modern, high-performance Python framework that provides automatic API documentation, asynchronous request handling, and strong type validation.

The application follows a modular architecture, separating configuration, routing, database models, validation schemas, and utility functions into dedicated modules. This organization improves maintainability, scalability, and code readability.

---

# Backend Workflow

```
                Frontend
                    │
         HTTP Request (JSON)
                    │
                    ▼
             FastAPI Router
                    │
                    ▼
          Request Validation
             (Pydantic)
                    │
                    ▼
          Business Logic Layer
                    │
                    ▼
            SQLAlchemy ORM
                    │
                    ▼
          PostgreSQL Database
                    │
                    ▼
             Query Result
                    │
                    ▼
          JSON Response
                    │
                    ▼
                Frontend
```

---

# Project Structure

```
backend/
│
├── app/
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── dependencies.py
│   │
│   ├── db/
│   │   ├── database.py
│   │   └── session.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── role.py
│   │   ├── company.py
│   │   ├── project.py
│   │   └── milestone.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── companies.py
│   │   ├── projects.py
│   │   └── milestones.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── company.py
│   │   ├── company_registration.py
│   │   ├── project.py
│   │   └── milestone.py
│   │
│   ├── utils/
│   │   └── company_code.py
│   │
│   └── main.py
│
├── requirements.txt
└── README.md
```

---

# Core Module

The **core** module contains the application's configuration and security-related components.

Its responsibilities include:

- Loading application configuration.
- Managing JWT settings.
- Password hashing and verification.
- Authentication dependencies.
- Authorization helpers.
- Security utilities.

Keeping these functionalities centralized avoids code duplication and simplifies future maintenance.

---

# Database Module

The **db** module is responsible for establishing communication with PostgreSQL.

It provides:

- Database engine creation.
- Database session management.
- Dependency injection for database sessions.
- Transaction handling.

Each API request receives an independent database session that is automatically closed after the request has been completed.

---

# Models

The **models** directory contains SQLAlchemy ORM models that represent database tables.

Current models include:

- User
- Role
- Company
- Project
- Milestone

These models define:

- Table structure
- Primary keys
- Foreign keys
- Relationships
- Constraints

Instead of writing raw SQL queries, SQLAlchemy automatically converts Python objects into SQL statements.

Example workflow:

```
User Object
      │
      ▼
SQLAlchemy ORM
      │
      ▼
users Table
```

This approach improves code readability and simplifies CRUD operations.

---

# Schemas

The **schemas** module contains Pydantic models responsible for validating incoming requests and formatting outgoing responses.

Schemas ensure that:

- Required fields are present.
- Data types are correct.
- Invalid input is rejected before reaching the database.
- API responses follow a consistent structure.

For example, during user registration, fields such as email, password, and phone number are validated before processing.

---

# Routes

The **routes** directory contains all REST API endpoints.

Each route performs the following sequence:

1. Receives the client request.
2. Validates request data.
3. Executes business logic.
4. Performs database operations.
5. Returns a JSON response.

Current route modules include:

- Authentication
- Company Management
- Project Management
- Milestone Management

---

# Utilities

The **utils** module stores reusable helper functions used across the application.

Current utility:

- Company Code Generator

Example:

```
generate_company_code()
```

Instead of duplicating logic in multiple routes, reusable functions are placed inside the utility module.

---

# Authentication

The backend uses **OAuth2 Password Flow** together with **JSON Web Tokens (JWT)** for authentication.

Authentication process:

```
User Login
      │
      ▼
Verify Email
      │
      ▼
Verify Password
      │
      ▼
Generate JWT Token
      │
      ▼
Return Access Token
```

The client stores the generated JWT token and includes it in subsequent API requests.

Protected endpoints verify the token before processing requests.

---

# Authorization

Authorization is implemented using **Role-Based Access Control (RBAC)**.

Supported roles include:

- Administrator
- Project Manager
- Site Engineer
- Supervisor
- Client

Each protected endpoint verifies the user's assigned role before allowing access.

Example:

```
User Request
      │
      ▼
Validate JWT
      │
      ▼
Retrieve User Role
      │
      ▼
Permission Check
      │
      ▼
Grant or Deny Access
```

---

# Password Security

Passwords are never stored in plain text.

Before storing credentials:

```
Password
    │
    ▼
Hash Function
    │
    ▼
Database
```

During login:

```
Entered Password
        │
        ▼
Hash Verification
        │
        ▼
Stored Password Hash
        │
        ▼
Authentication Result
```

This ensures user credentials remain protected even if database contents are exposed.

---

# Company Registration

Company onboarding is performed using a dedicated registration endpoint.

The registration process performs multiple database operations within a single transaction.

Workflow:

```
Company Registration Request
            │
            ▼
Validate Request
            │
            ▼
Generate Company Code
            │
            ▼
Create Company
            │
            ▼
Retrieve Administrator Role
            │
            ▼
Create Administrator User
            │
            ▼
Commit Transaction
            │
            ▼
Return Company Information
```

Using a single transaction guarantees database consistency. If any step fails, all changes are rolled back.

---

# Database Communication

Database interaction follows this sequence:

```
Client Request
      │
      ▼
API Route
      │
      ▼
SQLAlchemy Query
      │
      ▼
PostgreSQL
      │
      ▼
Database Result
      │
      ▼
JSON Response
```

SQLAlchemy automatically translates ORM operations into SQL queries, reducing manual database management.

---

# REST API

The backend exposes RESTful APIs for all supported modules.

## Authentication

```
POST   /auth/register
POST   /auth/login
GET    /auth/me
PUT    /auth/me
PUT    /auth/change-password
```

---

## Companies

```
POST   /companies/register
GET    /companies
GET    /companies/{company_id}
PUT    /companies/{company_id}
DELETE /companies/{company_id}
```

---

## Projects

```
POST   /projects
GET    /projects
GET    /projects/{project_id}
PUT    /projects/{project_id}
DELETE /projects/{project_id}
```

---

## Milestones

```
POST   /milestones
GET    /milestones
GET    /milestones/{milestone_id}
PUT    /milestones/{milestone_id}
DELETE /milestones/{milestone_id}
```

---

# JSON Communication

All API endpoints exchange data using JSON.

Example response:

```json
{
  "company_id": 1,
  "company_name": "ABC Constructions",
  "company_code": "BT-A72X91",
  "company_email": "admin@abc.com"
}
```

JSON provides a lightweight and standardized format for communication between the frontend and backend.

---

# API Documentation

FastAPI automatically generates interactive API documentation.

Available documentation endpoints:

```
Swagger UI
http://localhost:8000/docs
```

```
ReDoc
http://localhost:8000/redoc
```

Developers can test API endpoints directly from these interfaces without requiring external tools.

---

# Advantages of the Backend Design

- Modular architecture
- Clean separation of concerns
- Scalable project structure
- Secure JWT-based authentication
- Role-Based Access Control
- Automatic request validation
- ORM-based database interaction
- Transaction-safe operations
- RESTful API design
- Automatic API documentation
- Easy frontend integration
- Maintainable and extensible codebase

---

# Summary

The BuildTrack backend is designed as a modular, secure, and scalable REST API that manages authentication, company onboarding, user management, projects, and milestones while interacting with a PostgreSQL database through SQLAlchemy ORM.

By combining FastAPI, SQLAlchemy, Pydantic, JWT authentication, and PostgreSQL, the backend provides a reliable foundation for future modules such as workforce management, inventory tracking, financial management, document management, reporting, and analytics.

---

# Running the Backend

## Prerequisites

Before running the application, ensure the following software is installed:

- Python 3.12 or later
- PostgreSQL
- Git (optional, for cloning the repository)
- pip (Python package manager)

---

# Step 1: Clone the Repository

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd BuildTrack-Batch1
```

---

# Step 2: Navigate to the Backend Directory

```bash
cd backend
```

---

# Step 3: Create a Virtual Environment

### Windows

```bash
python -m venv .venv
```

### Linux / macOS

```bash
python3 -m venv .venv
```

---

# Step 4: Activate the Virtual Environment

### Windows (Command Prompt)

```cmd
.venv\Scripts\activate
```

### Windows (PowerShell)

```powershell
.venv\Scripts\Activate.ps1
```

### Linux / macOS

```bash
source .venv/bin/activate
```

After activation, the terminal should display:

```text
(.venv)
```

---

# Step 5: Install Dependencies

Install all required Python packages.

```bash
pip install -r requirements.txt
```

---

# Step 6: Configure PostgreSQL

Create a PostgreSQL database.

Example:

```sql
CREATE DATABASE buildtrack;
```

Update your database configuration (for example, in `.env` or `config.py`) with your PostgreSQL credentials.

Example:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=buildtrack
DB_USER=postgres
DB_PASSWORD=your_password
```

---

# Step 7: Create the Database Schema

Run the SQL scripts located in the `database/` folder.

Execute them in the following order:

1. `database_setup.sql`
2. `database_schema.sql`
3. `sample_data.sql` (optional)

This creates all required tables and inserts any initial data if applicable.

---

# Step 8: Run the Backend Server

Start the FastAPI development server.

```bash
uvicorn app.main:app --reload
```

If everything is configured correctly, you should see output similar to:

```text
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

# Step 9: Access the API Documentation

Swagger UI

```
http://127.0.0.1:8000/docs
```

ReDoc

```
http://127.0.0.1:8000/redoc
```

These interfaces allow developers to explore and test all available API endpoints directly from the browser.

---

# Stopping the Server

To stop the server, press:

```
CTRL + C
```

---

# Deactivating the Virtual Environment

After completing development, deactivate the virtual environment:

```bash
deactivate
```

---

# Common Issues

## ModuleNotFoundError

Install the required dependencies again:

```bash
pip install -r requirements.txt
```

---

## Database Connection Error

Verify:

- PostgreSQL is running.
- Database credentials are correct.
- The database exists.
- PostgreSQL is listening on port **5432**.

---

## Port Already in Use

Run the application on another port:

```bash
uvicorn app.main:app --reload --port 8001
```

---

# Development Workflow

1. Activate the virtual environment.
2. Navigate to the `backend` directory.
3. Pull the latest changes from your Git branch.
4. Install or update dependencies if `requirements.txt` has changed.
5. Start the FastAPI server.
6. Test endpoints using Swagger UI.
7. Commit and push your changes to your branch.
>>>>>>> 8d18d93c7d10a48be00b592cd455a3bd5032a0f4
