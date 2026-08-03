import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from './auth.service';
import { userHasAccess } from './auth.models';

export function roleGuard(...accessTargets: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);

    const router = inject(Router);

    return authService.ensureCurrentUser().pipe(
      map((user) => {
        if (!user) {
          return router.createUrlTree(['/login']);
        }

        return userHasAccess(user, accessTargets) ? true : router.createUrlTree(['/unauthorized']);
      }),
    );
  };
}
