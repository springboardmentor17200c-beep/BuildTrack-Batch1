import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthDataService } from '../auth-data.service';

// Blocks access to any route it's attached to unless someone is logged in.
// Usage in app.routes.ts:
//   { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthDataService);
  const router = inject(Router);

  if (auth.currentUser) return true;

  router.navigate(['/login']);
  return false;
};
