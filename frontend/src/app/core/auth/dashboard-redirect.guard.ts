import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
import { RoleName } from './auth.models';

// Used on the bare '/dashboard' entry route. It never renders anything
// itself -- it just figures out where to send the user next:
//   - not logged in           -> /login
//   - logged in, role known   -> /dashboard/<role-path>
//   - logged in, role unknown -> /unauthorized
//
// Usage in app.routes.ts:
//   { path: 'dashboard', pathMatch: 'full', canActivate: [dashboardRedirectGuard] }
//   { path: 'dashboard', children: DASHBOARD_ROUTES }

// Maps each role to its dashboard path, matching DASHBOARD_ROUTES in
// dashboards.routes.ts (mounted at 'dashboard' -> /dashboard/admin etc.)
const ROLE_DASHBOARD_PATH: Partial<Record<RoleName, string>> = {
  Administrator: 'admin',
  'Project Manager': 'pm',
  'Site Engineer': 'site-engineer',
  Contractor: 'contractor',
  Client: 'client',
  // 'Worker' has no dashboard route yet -- falls back to /unauthorized below.
};

export const dashboardRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureCurrentUser().pipe(
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }

      const path = ROLE_DASHBOARD_PATH[user.role_name as RoleName];
      return router.createUrlTree(path ? ['/dashboard', path] : ['/unauthorized']);
    }),
  );
};
