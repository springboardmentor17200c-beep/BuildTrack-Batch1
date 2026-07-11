import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ProjectsComponent } from './features/projects/projects';
import { RESOURCE_MANAGEMENT_ROUTES } from './features/resource-management/resource-management.routes';
import { INVENTORY_ROUTES } from './features/inventory/inventory.routes';
import { WORKFORCE_ROUTES } from './features/workforce/workforce.routes';
import { ANALYTICS_ROUTES } from './features/analytics/analytics.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'resources', children: RESOURCE_MANAGEMENT_ROUTES },
  { path: 'inventory', children: INVENTORY_ROUTES },
  { path: 'workforce', children: WORKFORCE_ROUTES },
  { path: 'analytics', children: ANALYTICS_ROUTES },
  { path: '**', redirectTo: 'login' },
];