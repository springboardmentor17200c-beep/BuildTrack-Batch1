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
