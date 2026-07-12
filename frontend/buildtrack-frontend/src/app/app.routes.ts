import { Routes } from '@angular/router';

// Auth screens (public)
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { ResetPassword } from './features/reset-password/reset-password';
import { Unauthorized } from './features/unauthorized/unauthorized';

// In-app screens (logged in required)
import { ProjectsComponent } from './features/projects/projects';
import { Profile } from './features/profile/profile';

// Guards
import { authGuard } from './features/auth/guards/auth.guard';
import { roleGuard } from './features/auth/guards/role.guard';
import { dashboardRedirectGuard } from './features/auth/guards/dashboard-redirect.guard';

// Feature modules (role-restricted)
import { RESOURCE_MANAGEMENT_ROUTES } from './features/resource-management/resource-management.routes';
import { INVENTORY_ROUTES } from './features/inventory/inventory.routes';
import { WORKFORCE_ROUTES } from './features/workforce/workforce.routes';
import { ANALYTICS_ROUTES } from './features/analytics/analytics.routes';
import { DASHBOARD_ROUTES } from './features/dashboards/dashboards.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public — no guard, anyone can reach these
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'reset-password', component: ResetPassword },
  { path: 'unauthorized', component: Unauthorized },

  // Logged-in only — no role restriction
  { path: 'projects', component: ProjectsComponent, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },

  // Dashboard: bare /dashboard never renders anything itself — the guard
  // always redirects (to /login, to the right role dashboard, or to
  // /unauthorized), then the 5 actual role dashboards live under /dashboard/*
  { path: 'dashboard', pathMatch: 'full', canActivate: [dashboardRedirectGuard], children: [] },
  { path: 'dashboard', children: DASHBOARD_ROUTES },

  // Logged-in AND role-restricted
  { path: 'resources', children: RESOURCE_MANAGEMENT_ROUTES, canActivate: [roleGuard('resources')] },
  { path: 'inventory', children: INVENTORY_ROUTES, canActivate: [roleGuard('inventory')] },
  { path: 'workforce', children: WORKFORCE_ROUTES, canActivate: [roleGuard('workforce')] },
  { path: 'analytics', children: ANALYTICS_ROUTES, canActivate: [roleGuard('analytics')] },

  { path: '**', redirectTo: 'login' },
];
