import { Routes } from '@angular/router';
import { ResourceHubComponent } from './resource-hub/resource-hub.component';
import { ResourceAllocationComponent } from './resource-allocation/resource-allocation.component';
import { EquipmentTrackingComponent } from './equipment-tracking/equipment-tracking.component';
import { ResourceUtilizationDashboardComponent } from './resource-utilization-dashboard/resource-utilization-dashboard.component';
import { MaintenanceSchedulingComponent } from './maintenance-scheduling/maintenance-scheduling.component';
// Mount these under your main app routes, e.g.:
//   { path: 'resources', children: RESOURCE_MANAGEMENT_ROUTES }
// Result: /resources, /resources/allocation, /resources/tracking, /resources/utilization
export const RESOURCE_MANAGEMENT_ROUTES: Routes = [
  { path: '', component: ResourceHubComponent },
  { path: 'allocation', component: ResourceAllocationComponent },
  { path: 'tracking', component: EquipmentTrackingComponent },
  { path: 'utilization', component: ResourceUtilizationDashboardComponent },
  {
    path: 'maintenance',component: MaintenanceSchedulingComponent
}
];

