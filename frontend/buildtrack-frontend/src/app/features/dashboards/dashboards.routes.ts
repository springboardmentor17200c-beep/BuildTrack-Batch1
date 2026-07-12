import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PmDashboardComponent } from './pm-dashboard/pm-dashboard.component';
import { SiteEngineerDashboardComponent } from './site-engineer-dashboard/site-engineer-dashboard.component';
import { ContractorDashboardComponent } from './contractor-dashboard/contractor-dashboard.component';
import { ClientDashboardComponent } from './client-dashboard/client-dashboard.component';
import { roleGuard } from '../auth/guards/role.guard';

// Mount these under your main app routes, e.g.:
//   { path: 'dashboard', children: DASHBOARD_ROUTES }
// Result: /dashboard/admin, /dashboard/pm, /dashboard/site-engineer,
//         /dashboard/contractor, /dashboard/client
// Each route is guarded so only the matching role can open it — see
// MODULE_ACCESS in auth.model.ts for the 'dashboard-*' keys.
export const DASHBOARD_ROUTES: Routes = [
  { path: 'admin', component: AdminDashboardComponent, canActivate: [roleGuard('dashboard-admin')] },
  { path: 'pm', component: PmDashboardComponent, canActivate: [roleGuard('dashboard-pm')] },
  { path: 'site-engineer', component: SiteEngineerDashboardComponent, canActivate: [roleGuard('dashboard-site-engineer')] },
  { path: 'contractor', component: ContractorDashboardComponent, canActivate: [roleGuard('dashboard-contractor')] },
  { path: 'client', component: ClientDashboardComponent, canActivate: [roleGuard('dashboard-client')] },
];
