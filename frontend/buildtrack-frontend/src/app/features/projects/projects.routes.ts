import { Routes } from '@angular/router';
import { ProjectsHubComponent } from './projects-hub/projects-hub.component';
import { ProjectListingComponent } from './project-listing/project-listing.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { MilestoneTrackingComponent } from './milestone-tracking/milestone-tracking.component';
import { ProjectStatusDashboardComponent } from './project-status-dashboard/project-status-dashboard.component';

// Mount these under your main app routes, e.g.:
//   { path: 'projects', children: PROJECTS_ROUTES }
// Result: /projects, /projects/list, /projects/detail/:id,
//         /projects/milestones, /projects/status
export const PROJECTS_ROUTES: Routes = [
  { path: '', component: ProjectsHubComponent },
  { path: 'list', component: ProjectListingComponent },
  { path: 'detail/:id', component: ProjectDetailsComponent },
  { path: 'milestones', component: MilestoneTrackingComponent },
  { path: 'status', component: ProjectStatusDashboardComponent },
];
