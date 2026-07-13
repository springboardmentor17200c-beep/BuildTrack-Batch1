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
