import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { } from '../../shared/sidebar/app-sidebar.component';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser } from '../../auth/models/auth.model';
import { AnalyticsDataService } from '../../analytics/analytics-data.service';
import { ProjectProgressSummary } from '../../analytics/models/analytics.model';
import { TranslatePipe } from '../../shared/translate.pipe';

interface UpdateItem {
  text: string;
  date: string;
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css'],
})
export class ClientDashboardComponent implements OnInit {
  currentUser: AppUser | null = null;
  projects: ProjectProgressSummary[] = [];
  budgetUsedPercent = 0;

  // Client-facing language only — no internal cost breakdown, matching
  // that a Client shouldn't see granular category-level spend, just
  // overall status and progress.
  updates: UpdateItem[] = [
    { text: 'Foundation work completed and approved by site engineer.', date: '2026-06-28' },
    { text: 'Structural framing 78% complete on Skyline Residency Tower.', date: '2026-07-05' },
    { text: 'Material delivery received — no delays reported.', date: '2026-07-08' },
  ];

  constructor(private auth: AuthDataService, private analytics: AnalyticsDataService) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;

    this.analytics.progress$.subscribe(rows => {
      this.projects = rows;
    });

    const approved = this.analytics.totalApprovedBudget();
    const spent = this.analytics.totalSpent();
    this.budgetUsedPercent = approved ? Math.round((spent / approved) * 100) : 0;
  }

  statusClass(status: ProjectProgressSummary['status']) {
    return { Planning: 'gray', 'In Progress': 'blue', 'On Hold': 'orange', Completed: 'green' }[status];
  }
}
