import { Routes } from '@angular/router';
import { ResourceHubComponent } from './resource-hub/resource-hub.component';
import { ResourceAllocationComponent } from './resource-allocation/resource-allocation.component';
import { EquipmentTrackingComponent } from './equipment-tracking/equipment-tracking.component';
import { ResourceUtilizationDashboardComponent } from './resource-utilization-dashboard/resource-utilization-dashboard.component';
import { MaintenanceSchedulingComponent } from './maintenance-scheduling/maintenance-scheduling.component';
import { ResourceCategoriesComponent } from './resource-categories/resource-categories.component';

export const RESOURCE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: ResourceHubComponent
  },
  {
    path: 'resource-categories',
    component: ResourceCategoriesComponent
  },
  {
    path: 'allocation',
    component: ResourceAllocationComponent
  },
  {
    path: 'tracking',
    component: EquipmentTrackingComponent
  },
  {
    path: 'utilization',
    component: ResourceUtilizationDashboardComponent
  },
  {
    path: 'maintenance',
    component: MaintenanceSchedulingComponent
  }
];