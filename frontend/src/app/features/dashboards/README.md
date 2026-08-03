# Role-Based Dashboards — BuildTrack

The 5 Dashboard Screens from the SRS wireframes, each a full screen (not a
hub-with-cards like the other modules) tailored to what that role actually
needs to see. Every dashboard **reuses your existing services** —
Resource, Inventory, Workforce, Analytics, Auth — rather than duplicating
data a third or fourth time.

## What's inside

```
features/
  dashboards/
    dashboards.routes.ts             Route definitions with role guards
    admin-dashboard/                 Users, project monitoring, system analytics, reports, activity
    pm-dashboard/                    Project progress, budget, workforce, resources, procurement
    site-engineer-dashboard/         Equipment status, stock alerts, today's attendance
    contractor-dashboard/            Crew, shifts, allocated equipment, material requests
    client-dashboard/                Read-only project progress + plain-language updates
  auth/                              UPDATED — see below
  login/login.ts                     UPDATED — see below
```

## What changed in the auth files (already in this zip)

- **`auth.model.ts`** — added `dashboard-admin`, `dashboard-pm`,
  `dashboard-site-engineer`, `dashboard-contractor`, `dashboard-client`
  entries to `MODULE_ACCESS`, plus a new `DASHBOARD_ROUTE_BY_ROLE` map.
- **`auth-data.service.ts`** — added `getAllUsers()` for the Admin
  Dashboard's User Management panel.
- **`login.ts`** — after a successful login, it now redirects to the
  dashboard matching the user's role (`/dashboard/admin`,
  `/dashboard/pm`, etc.) instead of a single generic `/dashboard`.
- **New: `guards/dashboard-redirect.guard.ts`** — if someone lands on
  bare `/dashboard` (bookmark, typed URL), this sends them to their
  correct role dashboard automatically.

Just overwrite your existing copies of these 3 files with the ones in
this zip, and add the 1 new guard file.

## Install

**1. Copy the `dashboards` folder** into `features/`.

**2. Overwrite** `features/auth/models/auth.model.ts`,
`features/auth/auth-data.service.ts`, and `features/login/login.ts` with
the versions in this zip.

**3. Add the new guard file** to `features/auth/guards/`.

**4. Update `app.routes.ts`** — replace your teammate's single generic
dashboard route with the 5 role-based ones:

```ts
import { DASHBOARD_ROUTES } from './features/dashboards/dashboards.routes';
import { dashboardRedirectGuard } from './features/auth/guards/dashboard-redirect.guard';

export const routes: Routes = [
  // ... your other routes (login, register, reset-password, profile, etc.)

  // Replace the old single dashboard route with these two:
  // 1) bare /dashboard redirects to the right role dashboard
  { path: 'dashboard', pathMatch: 'full', canActivate: [dashboardRedirectGuard], component: DashboardComponent },
  // 2) the 5 actual role dashboards live under /dashboard/*
  { path: 'dashboard', children: DASHBOARD_ROUTES },

  // ...resources, inventory, workforce, analytics stay as they were
];
```
(The `component: DashboardComponent` on the first entry is never actually
rendered — `dashboardRedirectGuard` always navigates away before
activation completes. Angular still requires *something* there for the
route to be valid, so reusing your existing generic Dashboard component
as a placeholder is the simplest option — no new file needed.)

**5. Run it**
```
ng serve
```

## Testing each dashboard

Using the 3 mock accounts (password `password123` for all):

| Login as | Lands on |
|---|---|
| arjun.rao@buildtrack.com | `/dashboard/admin` |
| priya.menon@buildtrack.com | `/dashboard/pm` |
| karthik.iyer@buildtrack.com | `/dashboard/site-engineer` |

Contractor and Client dashboards don't have seeded mock accounts yet —
register a new account through `/register` and pick that role to test
them, or add a seeded user directly in `auth-data.service.ts`.

## Design notes

- Kept every visual element to existing `bt-theme.css` classes
  (`bt-stat-card`, `bt-panel`, `bt-badge`, `bt-progress`, `bt-table`,
  `bt-filter-btn`) — no new styles were introduced. The more "modern,
  professional" feel comes from layout and information hierarchy (multi-
  column panel grids, a welcome header with role badge, quick-jump links
  into the relevant module) rather than new visual language.
- Each dashboard's numbers are **live**, not separately mocked — Admin's
  "Avg. Resource Utilization" and PM's "Resource Utilization" both call
  the same `ResourceDataService.getUtilization()`, so allocating a
  resource on the Resource Management module updates both dashboards
  automatically.
- Worker doesn't have a dedicated dashboard (the SRS only lists 5
  wireframes, and Worker wasn't one of them) — they're mapped to the
  Site Engineer dashboard as a reasonable fallback in
  `DASHBOARD_ROUTE_BY_ROLE`. Worth confirming with your team whether
  Workers should get their own simple dashboard instead.
- Client Dashboard deliberately shows **no cost breakdown by category**
  — only overall status, completion %, and plain-language updates — since
  a client likely shouldn't see internal spend detail like labor vs.
  material cost splits.
