# BuildTrack

**BuildTrack** is a comprehensive Construction Project Management & Site Monitoring Platform. It provides role-based access for everyone involved in a construction project—from Administrators and Project Managers to Site Engineers, Contractors, Workers, and Clients—allowing them to seamlessly manage projects, track inventory, handle procurement, and monitor workforce analytics.

---

## 🛠 Tech Stack

*   **Frontend**: Angular 17+ (Standalone Components), TypeScript, RxJS
*   **Backend**: Python 3.10+, FastAPI, SQLAlchemy (ORM), Pydantic
*   **Database**: PostgreSQL
*   **Security**: JWT-based Authentication, bcrypt password hashing

---

## 🚀 Quick Start Setup (Local Development)

Follow these steps to get both the frontend and backend running on your local machine.

### Prerequisites
Make sure you have installed:
1. **Node.js** (v18+)
2. **Python** (v3.10+)
3. **PostgreSQL** (running locally on port `5432` or `5433`)

### 1. Backend Setup (FastAPI)
Open a terminal and navigate to the `backend` folder:

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 2. Install Python dependencies
pip install -r requirements.txt
```

**Database Configuration:**
Create a `.env` file inside the `backend` folder with your local PostgreSQL credentials:
```env
DATABASE_URL=postgresql://postgres:1234@localhost:5432/buildtrack_db
SECRET_KEY=supersecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```
*(Update `postgres:1234` and the port if your local PostgreSQL setup uses different credentials).*

**Start the Server:**
```bash
uvicorn app.main:app --reload
```
> **Magic Database Init:** You do *not* need to run manual database migrations! The FastAPI backend is configured to automatically detect if the `buildtrack_db` database exists, create it if it doesn't, and instantly generate all the required SQL tables on startup.

### 2. Frontend Setup (Angular)
Open a **new** terminal window and navigate to the frontend folder:

```bash
cd frontend/buildtrack-frontend

# 1. Install Node modules
npm install

# 2. Start the development server
npm start
```

Once both servers are running, open your browser and navigate to **[http://localhost:4200](http://localhost:4200)**. 

---

## 👥 Role-Based Access Control (RBAC)

BuildTrack dynamically updates its UI and routes users to specific dashboards based on their role. 

| Role | Dashboard Route | Primary Permissions |
| :--- | :--- | :--- |
| **Administrator** | `/dashboard/admin` | Full system access, User Management, Global Analytics. |
| **Project Manager** | `/dashboard/pm` | Projects, Inventory, Workforce, Analytics, Approvals. |
| **Site Engineer** | `/dashboard/site-engineer` | On-site updates, Material requests, Project tracking. |
| **Contractor** | `/dashboard/contractor` | Workforce logging, Inventory viewing. |
| **Worker** | `/dashboard/worker` | Personal attendance, shift schedules. |
| **Vendor** | `/procurement/vendor-dashboard` | Manage Purchase Orders, submit Invoices. |
| **Client / Owner** | `/dashboard/client` | High-level read-only dashboard for project progress. |

*You can register a test account of any role directly at `http://localhost:4200/register`.*

---

## 📦 Core Modules

1. **Projects**: Track project milestones, statuses (Planning, In Progress, On Hold, Completed), and allocated budgets.
2. **Resource Management**: Manage heavy machinery and equipment allocation across different sites.
3. **Inventory**: Track raw materials, manage stock levels, and submit material allocation requests.
4. **Workforce**: Log daily attendance, schedule shifts, and track employment statuses.
5. **Procurement**: End-to-end workflow from Purchase Requisitions (PRs) to Purchase Orders (POs) and Invoicing.
6. **Analytics**: Real-time KPI dashboards and downloadable PDF/Excel reports.

---

## 🔧 Important Technical Notes for Developers

*   **Angular Change Detection (Zone.js)**: Do **not** use the `withFetch()` provider in `app.config.ts`. It has been intentionally removed because native fetch promises resolve outside of the Angular Zone in our setup, which causes the UI to hang on loading spinners until the user physically clicks the screen. We use the standard `XMLHttpRequest` engine via Angular's default `HttpClient`.
*   **API Routing**: All authentication and user endpoints are prefixed with `/auth/` (e.g., `POST /auth/login`, `GET /auth/me`). 
*   **Profile Images**: Profile images are fully supported and persist to the database. The frontend `toAppUser` mapper securely filters the API responses to populate the UI.
*   **API Documentation**: The backend automatically generates interactive API docs. While the backend is running, visit **[http://localhost:8000/docs](http://localhost:8000/docs)** to test endpoints directly.

---
*Developed for the BuildTrack Project Management Suite.*
