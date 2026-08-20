import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthDataService } from '../auth-data.service';
import { DASHBOARD_ROUTE_BY_ROLE } from '../models/auth.model';

// Used on the bare '/dashboard' entry route. It never renders anything
// itself -- it just figures out where to send the user next:
//   - not logged in           -> /login
//   - logged in, role known   -> /dashboard/<role-path>
//   - logged in, role unknown -> /unauthorized
//
// Usage in app.routes.ts:
//   { path: 'dashboard', pathMatch: 'full', canActivate: [dashboardRedirectGuard] }
//   { path: 'dashboard', children: DASHBOARD_ROUTES }

export const dashboardRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthDataService);
  const router = inject(Router);

  const user = auth.currentUser;

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const route = DASHBOARD_ROUTE_BY_ROLE[user.role];
  router.navigate(route ? [route] : ['/unauthorized']);
  return false;
};
