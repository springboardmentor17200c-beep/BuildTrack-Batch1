import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSidebarComponent } from '../../shared/sidebar/app-sidebar.component';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser, RoleName } from '../../auth/models/auth.model';
import { AnalyticsDataService } from '../../analytics/analytics-data.service';
import { ProjectProgressSummary } from '../../analytics/models/analytics.model';
import { ResourceDataService } from '../../resource-management/resource-data.service';

interface RoleCount {
  role: RoleName;
  count: number;
}

interface ActivityItem {
  icon: 'user' | 'project' | 'budget' | 'resource';
  text: string;
  time: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppSidebarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  currentUser: AppUser | null = null;
  users: AppUser[] = [];
  roleCounts: RoleCount[] = [];
  projects: ProjectProgressSummary[] = [];

  totalUsers = 0;
  activeProjects = 0;
  avgUtilization = 0;
  budgetUsedPercent = 0;

  activity: ActivityItem[] = [
    { icon: 'project', text: 'Skyline Residency Tower progress updated to 78%', time: '2 hours ago' },
    { icon: 'budget', text: 'Riverside Business Park expense recorded — ₹1.85L material cost', time: '5 hours ago' },
    { icon: 'user', text: 'New user registered — Site Engineer role', time: '1 day ago' },
    { icon: 'resource', text: 'CAT 320 Excavator marked under maintenance', time: '1 day ago' },
  ];

  constructor(
    private auth: AuthDataService,
    private analytics: AnalyticsDataService,
    private resourceData: ResourceDataService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;
    this.users = this.auth.getAllUsers();
    this.totalUsers = this.users.length;

    const roles = Array.from(new Set(this.users.map(u => u.role)));
    this.roleCounts = roles.map(role => ({ role, count: this.users.filter(u => u.role === role).length }));

    this.analytics.progress$.subscribe(rows => {
      this.projects = rows;
      this.activeProjects = rows.filter(p => p.status === 'In Progress').length;
    });

    const approved = this.analytics.totalApprovedBudget();
    const spent = this.analytics.totalSpent();
    this.budgetUsedPercent = approved ? Math.round((spent / approved) * 100) : 0;

    this.resourceData.resources$.subscribe(resources => {
      const utilizations = resources.map(r => this.resourceData.getUtilization(r.resourceId));
      this.avgUtilization = utilizations.length
        ? Math.round(utilizations.reduce((s, v) => s + v, 0) / utilizations.length)
        : 0;
    });
  }

  statusClass(status: ProjectProgressSummary['status']) {
    return { Planning: 'gray', 'In Progress': 'blue', 'On Hold': 'orange', Completed: 'green' }[status];
  }

  roleClass(role: RoleName) {
    return {
      Administrator: 'purple',
      'Project Manager': 'blue',
      'Site Engineer': 'orange',
      Contractor: 'green',
      Worker: 'gray',
     'Client / Owner': 'blue',
    }[role];
  }
}
