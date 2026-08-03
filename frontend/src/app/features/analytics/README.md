# Analytics Module — BuildTrack

Same pattern as Resource Management, Inventory, and Workforce: one hub
screen with clickable options, connected sub-pages, shared `bt-theme.css`
styling, and back buttons throughout. This one has **4** sub-pages instead
of 3, matching the 4 Analytics Screens listed in your SRS wireframes:
Budget Analytics, Project Progress, Resource Analytics, and Procurement
Analytics.

## What's inside

```
analytics/
  models/analytics.model.ts          Shared TypeScript interfaces
  analytics-data.service.ts          Mock data + aggregation helpers
  analytics.routes.ts                Route definitions
  analytics-hub/                     Screen 1: the 4 clickable options + at-a-glance panel
  budget-analytics/                  Screen 2: approved budget vs. spend, by category & project
  progress-analytics/                Screen 3: completion %, status, category breakdown
  resource-analytics/                Screen 4: reuses ResourceDataService from Resource Management
  procurement-analytics/             Screen 5: vendor spend, order status, pending invoices
```

## A design note: no dedicated "analytics" table

Your database schema doc doesn't have an `analytics` table — and that's
correct, not a gap. Per the system architecture diagram, Analytics is a
**service layer** that aggregates data already sitting in `budgets`,
`expenses`, `progress_reports`, `purchase_orders`, `vendors`, and
`invoices`. That's exactly how `analytics-data.service.ts` is written:
mock arrays for those source tables, plus helper methods
(`totalApprovedBudget()`, `expensesByCategory()`, `orderStatusBreakdown()`,
etc.) that compute the numbers — the same shape a real backend aggregate
endpoint would return.

One deliberate exception: **Resource Analytics reuses
`ResourceDataService`** from the Resource Management module directly,
rather than duplicating resource data a third time. Since Resource
Management already owns the `resources`/`resource_allocations` mock data
and utilization calculation, Resource Analytics just asks it for the same
numbers from a different screen. This means the import path assumes
Analytics sits as a sibling folder to `resource-management` under
`features/` — if your repo structure differs, adjust the import at the
top of `resource-analytics/resource-analytics.component.ts`.

## Steps

**1. Copy the folder** into:
```
frontend\buildtrack-frontend\src\app\features\analytics
```
(same level as `resource-management`, `inventory`, `workforce`)

**2. Add the route** in `app.routes.ts`:
```ts
import { ANALYTICS_ROUTES } from './features/analytics/analytics.routes';

export const routes: Routes = [
  // ...your existing routes
  { path: 'analytics', children: ANALYTICS_ROUTES },
];
```
(Adjust the import path prefix if your other modules aren't under `./features/`.)

**3. Run it**
```
ng serve
```
Then visit:
- `/analytics` → hub with 4 cards + at-a-glance panel
- `/analytics/budget` → Budget Analytics
- `/analytics/progress` → Project Progress Analytics
- `/analytics/resources` → Resource Analytics
- `/analytics/procurement` → Procurement Analytics

## Connecting to the real backend later

Swap the mock arrays in `analytics-data.service.ts` for `HttpClient` calls
against aggregate endpoints once they exist, e.g. `GET /api/analytics/budgets`,
`GET /api/analytics/project-progress`, `GET /api/analytics/procurement`.
Components only depend on the service's public methods and observables, so
this should be a mechanical swap without touching the components.
