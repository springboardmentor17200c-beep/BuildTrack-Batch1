import os
import re
import glob

# 1. Fix auth.model.ts
auth_model_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/auth/models/auth.model.ts'
with open(auth_model_path, 'r', encoding='utf-8') as f:
    auth_content = f.read()

auth_content = auth_content.replace(
    "'dashboard-client': ['Client / Owner'],",
    "'dashboard-client': ['Client / Owner'],\n  'dashboard-worker': ['Worker'],"
)
auth_content = auth_content.replace(
    "Worker: '/dashboard/site-engineer',",
    "Worker: '/dashboard/worker',"
)

with open(auth_model_path, 'w', encoding='utf-8') as f:
    f.write(auth_content)

# 2. Fix dashboards.routes.ts
routes_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/dashboards.routes.ts'
with open(routes_path, 'r', encoding='utf-8') as f:
    routes_content = f.read()

if "WorkerDashboardComponent" not in routes_content:
    # Actually wait, ng generate created worker-dashboard.ts... Let's rename it to .component.ts to be safe
    old_ts = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/worker-dashboard/worker-dashboard.ts'
    new_ts = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/worker-dashboard/worker-dashboard.component.ts'
    
    if os.path.exists(old_ts):
        os.rename(old_ts, new_ts)
        os.rename(old_ts.replace('.ts', '.html'), new_ts.replace('.component.ts', '.component.html'))
        os.rename(old_ts.replace('.ts', '.css'), new_ts.replace('.component.ts', '.component.css'))
        os.rename(old_ts.replace('.ts', '.spec.ts'), new_ts.replace('.component.ts', '.component.spec.ts'))

    routes_content = "import { WorkerDashboardComponent } from './worker-dashboard/worker-dashboard.component';\n" + routes_content
    routes_content = routes_content.replace(
        "{ path: 'client', component: ClientDashboardComponent, canActivate: [roleGuard('dashboard-client')] },",
        "{ path: 'client', component: ClientDashboardComponent, canActivate: [roleGuard('dashboard-client')] },\n  { path: 'worker', component: WorkerDashboardComponent, canActivate: [roleGuard('dashboard-worker')] },"
    )
    with open(routes_path, 'w', encoding='utf-8') as f:
        f.write(routes_content)

# 3. Write Worker Dashboard component logic
worker_ts = """import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser } from '../../auth/models/auth.model';
import { Project } from '../../projects/models/projects.model';

@Component({
  selector: 'app-worker-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './worker-dashboard.component.html',
  styleUrls: ['./worker-dashboard.component.css']
})
export class WorkerDashboardComponent implements OnInit {
  currentUser: AppUser | null = null;
  assignedProjects: Project[] = [];
  todayTasks = 5;
  completedTasks = 2;
  attendancePercent = 95;

  constructor(private auth: AuthDataService) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      this.currentUser = u;
    });
  }

  statusClass(status: string) {
    return { Planning: 'gray', 'In Progress': 'blue', 'On Hold': 'orange', Completed: 'green' }[status] || 'gray';
  }
}
"""
with open(new_ts, 'w', encoding='utf-8') as f:
    f.write(worker_ts)

