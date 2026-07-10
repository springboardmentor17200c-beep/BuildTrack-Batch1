import { Routes } from '@angular/router';
import { InventoryHubComponent } from './inventory-hub/inventory-hub.component';
import { MaterialDashboardComponent } from './material-dashboard/material-dashboard.component';
import { StockMonitoringComponent } from './stock-monitoring/stock-monitoring.component';
import { ProcurementRequestComponent } from './procurement-request/procurement-request.component';

// Mount these under your main app routes, e.g.:
//   { path: 'inventory', children: INVENTORY_ROUTES }
// Result: /inventory, /inventory/dashboard, /inventory/stock, /inventory/requests
export const INVENTORY_ROUTES: Routes = [
  { path: '', component: InventoryHubComponent },
  { path: 'dashboard', component: MaterialDashboardComponent },
  { path: 'stock', component: StockMonitoringComponent },
  { path: 'requests', component: ProcurementRequestComponent },
];
