import { Routes } from '@angular/router';
import { WorkforceHubComponent } from './workforce-hub/workforce-hub.component';
import { WorkerDashboardComponent } from './worker-dashboard/worker-dashboard.component';
import { AttendanceTrackingComponent } from './attendance-tracking/attendance-tracking.component';
import { ShiftSchedulingComponent } from './shift-scheduling/shift-scheduling.component';

// Mount these under your main app routes, e.g.:
//   { path: 'workforce', children: WORKFORCE_ROUTES }
// Result: /workforce, /workforce/dashboard, /workforce/attendance, /workforce/shifts
export const WORKFORCE_ROUTES: Routes = [
  { path: '', component: WorkforceHubComponent },
  { path: 'dashboard', component: WorkerDashboardComponent },
  { path: 'attendance', component: AttendanceTrackingComponent },
  { path: 'shifts', component: ShiftSchedulingComponent },
];
