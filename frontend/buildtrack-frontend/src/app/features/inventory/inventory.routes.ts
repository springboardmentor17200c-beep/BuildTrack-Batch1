import { Routes } from '@angular/router';
import { InventoryHubComponent } from './inventory-hub/inventory-hub.component';
import { MaterialDashboardComponent } from './material-dashboard/material-dashboard.component';
import { MaterialRequestsComponent } from './material-requests/material-requests.component';
import { StockMonitoringComponent } from './stock-monitoring/stock-monitoring.component';
import { MaterialAllocationComponent } from './material-allocation/material-allocation.component';
import { StockManagementComponent } from './stock-management/stock-management.component';

export const INVENTORY_ROUTES: Routes = [
  // Hub is the landing page (no children — sub-pages are siblings)
  { path: '', component: InventoryHubComponent },

  // Sub-pages are full independent routes, NOT children of the hub
  { path: 'dashboard',  component: MaterialDashboardComponent },
  { path: 'requests',   component: MaterialRequestsComponent },
  { path: 'stock',      component: StockMonitoringComponent },
  { path: 'allocation', component: MaterialAllocationComponent },
  { path: 'management', component: StockManagementComponent },
];