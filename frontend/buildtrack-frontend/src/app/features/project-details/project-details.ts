import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { HeaderComponent } from './components/header/header';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards';
import { ProgressOverviewComponent } from './components/progress-overview/progress-overview';
import { MilestonesComponent } from './components/milestones/milestones';
import { ActivityTimelineComponent } from './components/activity-timeline/activity-timeline';
import { TeamMembersComponent } from './components/team-members/team-members';
import { BudgetSummaryComponent } from './components/budget-summary/budget-summary';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    KpiCardsComponent,
    ProgressOverviewComponent,
    MilestonesComponent,
    ActivityTimelineComponent,
    TeamMembersComponent,
    BudgetSummaryComponent,
  ],
  templateUrl: './project-details.html',
  styleUrl: './project-details.css',
})
export class ProjectDetails {

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/projects']);
  }

}