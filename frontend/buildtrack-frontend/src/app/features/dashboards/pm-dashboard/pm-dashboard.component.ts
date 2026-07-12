import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser } from '../../auth/models/auth.model';
import { AnalyticsDataService } from '../../analytics/analytics-data.service';
import { ProjectProgressSummary } from '../../analytics/models/analytics.model';
import { WorkforceDataService } from '../../workforce/workforce-data.service';
import { ResourceDataService } from '../../resource-management/resource-data.service';

@Component({
  selector: 'app-pm-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pm-dashboard.component.html',
  styleUrls: ['./pm-dashboard.component.css'],
})
export class PmDashboardComponent implements OnInit {
  currentUser: AppUser | null = null;
  projects: ProjectProgressSummary[] = [];

  activeProjects = 0;
  avgProgress = 0;
  budgetUsedPercent = 0;
  pendingOrders = 0;

  totalWorkers = 0;
  presentToday = 0;
  onLeave = 0;

  resourceUtilization = 0;
  inUseCount = 0;

  constructor(
    private auth: AuthDataService,
    private analytics: AnalyticsDataService,
    private workforceData: WorkforceDataService,
    private resourceData: ResourceDataService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;

    this.analytics.progress$.subscribe(rows => {
      this.projects = rows;
      this.activeProjects = rows.filter(p => p.status === 'In Progress').length;
      this.avgProgress = rows.length
        ? Math.round(rows.reduce((s, p) => s + p.completionPercentage, 0) / rows.length)
        : 0;
    });

    const approved = this.analytics.totalApprovedBudget();
    const spent = this.analytics.totalSpent();
    this.budgetUsedPercent = approved ? Math.round((spent / approved) * 100) : 0;
    this.pendingOrders = this.analytics.orderStatusBreakdown().find(s => s.status === 'Pending')?.count || 0;

    this.workforceData.workers$.subscribe(workers => {
      this.totalWorkers = workers.length;
      this.onLeave = workers.filter(w => w.status === 'On Leave').length;
    });
    this.workforceData.attendance$.subscribe(records => {
      this.presentToday = records.filter(r => r.status === 'Present').length;
    });

    this.resourceData.resources$.subscribe(resources => {
      this.inUseCount = resources.filter(r => r.currentStatus === 'Allocated').length;
      const utilizations = resources.map(r => this.resourceData.getUtilization(r.resourceId));
      this.resourceUtilization = utilizations.length
        ? Math.round(utilizations.reduce((s, v) => s + v, 0) / utilizations.length)
        : 0;
    });
  }

  statusClass(status: ProjectProgressSummary['status']) {
    return { Planning: 'gray', 'In Progress': 'blue', 'On Hold': 'orange', Completed: 'green' }[status];
  }
}
