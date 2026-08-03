import { Routes } from '@angular/router';
import { InventoryHubComponent } from './inventory-hub/inventory-hub.component';
import { MaterialDashboardComponent } from './material-dashboard/material-dashboard.component';
import { MaterialRequestsComponent } from './material-requests/material-requests.component';
import { StockMonitoringComponent } from './stock-monitoring/stock-monitoring.component';
import { MaterialAllocationComponent } from './material-allocation/material-allocation.component';
import { StockManagementComponent } from './stock-management/stock-management.component';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    component: InventoryHubComponent,
    children: [
      { path: 'dashboard', component: MaterialDashboardComponent },
      { path: 'requests', component: MaterialRequestsComponent },
      { path: 'stock', component: StockMonitoringComponent },
      { path: 'allocation', component: MaterialAllocationComponent },
      { path: 'management', component: StockManagementComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];