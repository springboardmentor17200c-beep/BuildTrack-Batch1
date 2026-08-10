import { Routes } from '@angular/router';

export const PROCUREMENT_ROUTES: Routes = [
  { path: '', redirectTo: 'hub', pathMatch: 'full' },
  { path: 'hub', loadComponent: () => import('./procurement-hub/procurement-hub.component').then(m => m.ProcurementHubComponent) },
  { path: 'vendors', loadComponent: () => import('./vendor-management/vendor-management.component').then(m => m.VendorManagementComponent) },
  { path: 'requests', loadComponent: () => import('./procurement-requests/procurement-requests.component').then(m => m.ProcurementRequestsComponent) },
  { path: 'requests/:id', loadComponent: () => import('./procurement-requests/procurement-requests.component').then(m => m.ProcurementRequestsComponent) },
  { path: 'workflow', loadComponent: () => import('./po-workflow/po-workflow.component').then(m => m.PoWorkflowComponent) },
  { path: 'workflow/:id', loadComponent: () => import('./po-workflow/po-workflow.component').then(m => m.PoWorkflowComponent) },
  { path: 'vendor-dashboard', loadComponent: () => import('./vendor-dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent) },
  { path: 'vendor-dashboard/:id', loadComponent: () => import('./vendor-dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent) }
];