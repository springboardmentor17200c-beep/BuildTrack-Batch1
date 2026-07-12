import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthDataService } from '../auth-data.service';
import { MODULE_ACCESS } from '../models/auth.model';

// Checks BOTH that someone is logged in AND that their role is allowed
// into the given module. Not logged in -> /login. Logged in but wrong
// role -> /unauthorized.
//
// Usage in app.routes.ts:
//   { path: 'resources', children: RESOURCE_MANAGEMENT_ROUTES, canActivate: [roleGuard('resources')] }
//
// The moduleKey must match a key in MODULE_ACCESS (see auth.model.ts) —
// that's where the actual role list per module lives, so you only need
// to edit access rules in one place.
export function roleGuard(moduleKey: keyof typeof MODULE_ACCESS): CanActivateFn {
  return () => {
    const auth = inject(AuthDataService);
    const router = inject(Router);

    const user = auth.currentUser;
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    const allowedRoles = MODULE_ACCESS[moduleKey] || [];
    if (!allowedRoles.includes(user.role)) {
      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  };
}
