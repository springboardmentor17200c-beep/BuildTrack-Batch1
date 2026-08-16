
import { Routes } from '@angular/router';

// Auth screens (public)
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { ResetPassword } from './features/reset-password/reset-password';
import { Unauthorized } from './features/unauthorized/unauthorized';
import { Landing } from './features/landing/landing';

// In-app screens (logged in required)
import { PROJECTS_ROUTES } from './features/projects/projects.routes';
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
import { PROCUREMENT_ROUTES } from './features/procurement/procurement.routes';
import { DASHBOARD_ROUTES } from './features/dashboards/dashboards.routes';

export const routes: Routes = [
  { path: '', component: Landing },

  // Public — no guard, anyone can reach these
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'reset-password', component: ResetPassword },
  { path: 'unauthorized', component: Unauthorized },

  // Logged-in only — no role restriction
  { path: 'projects', children: PROJECTS_ROUTES, canActivate: [roleGuard('projects')] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },

  // Dashboard
  { path: 'dashboard', pathMatch: 'full', canActivate: [dashboardRedirectGuard], children: [] },
  { path: 'dashboard', children: DASHBOARD_ROUTES },

  // Logged-in AND role-restricted
  { path: 'resources', children: RESOURCE_MANAGEMENT_ROUTES },
  { path: 'inventory', children: INVENTORY_ROUTES, canActivate: [roleGuard('inventory')] },
  { path: 'workforce', children: WORKFORCE_ROUTES, canActivate: [roleGuard('workforce')] },
  { path: 'analytics', children: ANALYTICS_ROUTES, canActivate: [roleGuard('analytics')] },
  { path: 'procurement', children: PROCUREMENT_ROUTES, canActivate: [roleGuard('procurement')] },

  { path: '**', redirectTo: 'landing' },
];