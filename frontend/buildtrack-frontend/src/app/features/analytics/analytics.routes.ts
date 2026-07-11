import { Routes } from '@angular/router';
import { AnalyticsHubComponent } from './analytics-hub/analytics-hub.component';
import { BudgetAnalyticsComponent } from './budget-analytics/budget-analytics.component';
import { ProgressAnalyticsComponent } from './progress-analytics/progress-analytics.component';
import { ResourceAnalyticsComponent } from './resource-analytics/resource-analytics.component';
import { ProcurementAnalyticsComponent } from './procurement-analytics/procurement-analytics.component';

// Mount these under your main app routes, e.g.:
//   { path: 'analytics', children: ANALYTICS_ROUTES }
// Result: /analytics, /analytics/budget, /analytics/progress,
//         /analytics/resources, /analytics/procurement
export const ANALYTICS_ROUTES: Routes = [
  { path: '', component: AnalyticsHubComponent },
  { path: 'budget', component: BudgetAnalyticsComponent },
  { path: 'progress', component: ProgressAnalyticsComponent },
  { path: 'resources', component: ResourceAnalyticsComponent },
  { path: 'procurement', component: ProcurementAnalyticsComponent },
];
