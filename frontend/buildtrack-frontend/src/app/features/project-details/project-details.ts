import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HeaderComponent, type ProjectHeaderData } from './components/header/header';
import { KpiCardsComponent, type KpiData } from './components/kpi-cards/kpi-cards';
import {
  ProgressOverviewComponent,
  type ProgressOverviewData,
} from './components/progress-overview/progress-overview';
import { MilestonesComponent, type Milestone } from './components/milestones/milestones';
import {
  ActivityTimelineComponent,
  type ProjectActivity,
} from './components/activity-timeline/activity-timeline';
import { TeamMembersComponent, type TeamMember } from './components/team-members/team-members';
import {
  BudgetSummaryComponent,
  type BudgetSummary,
} from './components/budget-summary/budget-summary';
import { DUMMY_PROJECTS, Project } from '../projects/projects';

export interface ProjectDetailsResponse {
  project: ProjectHeaderData;
  kpiData: KpiData;
  progressData: ProgressOverviewData;
  milestones: Milestone[];
  teamMembers: TeamMember[];
  budget: BudgetSummary;
  activities: ProjectActivity[];
}

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
export class ProjectDetails implements OnInit {
  projectData = signal<ProjectDetailsResponse | null>(null);
  error = signal<string | null>(null);

  /** Computed: Completed Milestones / Total Milestones × 100 */
  milestoneProgress = computed(() => {
    const data = this.projectData();
    if (!data || data.milestones.length === 0) return 0;
    const completed = data.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / data.milestones.length) * 100);
  });

  /** Derived progressData — overallProgress comes from milestones, not the API */
  derivedProgressData = computed(() => {
    const data = this.projectData();
    if (!data) return null;
    return {
      ...data.progressData,
      overallProgress: this.milestoneProgress(),
    };
  });

  /** Derived header data — progress synced with milestones */
  derivedHeaderData = computed(() => {
    const data = this.projectData();
    if (!data) return null;
    return {
      ...data.project,
      progress: this.milestoneProgress(),
    };
  });

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.error.set(null);
        const idParam = params.get('id');
        if (!idParam) {
          this.error.set('Project ID is required');
          return;
        }

        const id = parseInt(idParam, 10);
        const found = DUMMY_PROJECTS.find(p => p.id === id);

        if (!found) {
          this.error.set('Project Not Found');
          this.projectData.set(null);
          return;
        }

        this.projectData.set(this.buildDummyDetails(found));
      });
  }

  private buildDummyDetails(project: Project): ProjectDetailsResponse {
    return {
      project: {
        projectName: project.name,
        clientName: project.client,
        location: project.site,
        status: project.status,
        startDate: '01 Jan 2026',
        endDate: project.deadline,
        projectManager: project.manager,
        progress: project.progress
      },
      kpiData: {
        totalBudget: project.budgetTotal * 10000000,
        budgetUsed: project.budgetUsed * 10000000,
        workers: 145,
        machinery: 12,
        tasksCompleted: 45,
        tasksPending: 18,
        milestonesCompleted: 2,
        daysRemaining: 120
      },
      progressData: {
        overallProgress: project.progress,
        todayProgress: 2,
        plannedProgress: project.progress + 5,
        actualProgress: project.progress,
        delayDays: project.status === 'Delayed' ? 5 : 0,
        materials: [
          { name: 'Cement', used: 84, total: 100 },
          { name: 'Steel', used: 67, total: 100 },
          { name: 'Concrete', used: 72, total: 100 }
        ]
      },
      budget: {
        estimatedBudget: project.budgetTotal * 10000000,
        budgetUsed: project.budgetUsed * 10000000,
        remainingBudget: (project.budgetTotal - project.budgetUsed) * 10000000,
        labourCost: project.budgetUsed * 4000000,
        materialCost: project.budgetUsed * 4000000,
        machineryCost: project.budgetUsed * 2000000,
        currencyCode: 'INR'
      },
      milestones: [
        { title: 'Site Preparation', startDate: '01 Jan 2026', endDate: '15 Jan 2026', status: 'completed', completion: 100 },
        { title: 'Foundation Work', startDate: '16 Jan 2026', endDate: '28 Feb 2026', status: 'completed', completion: 100 },
        { title: 'Structural Framing', startDate: '01 Mar 2026', endDate: '30 May 2026', status: 'in-progress', completion: 45 },
        { title: 'Electrical & Plumbing', startDate: '01 Jun 2026', endDate: '15 Aug 2026', status: 'upcoming', completion: 0 }
      ],
      teamMembers: [
        { name: project.manager, role: 'Project Manager', avatar: project.managerAvatar, phone: '+91 98765 43210', assignedWork: 'Overall Management', status: 'active' },
        { name: 'Rahul Verma', role: 'Site Engineer', avatar: 'https://i.pravatar.cc/40?img=11', phone: '+91 98765 43211', assignedWork: 'Structural Planning', status: 'idle' },
        { name: 'Neha Gupta', role: 'Architect', avatar: 'https://i.pravatar.cc/40?img=5', phone: '+91 98765 43212', assignedWork: 'Design Oversight', status: 'on-leave' }
      ],
      activities: [
        { action: 'Concrete poured for block A', time: '2 hours ago', description: 'Phase 1 foundation work completed.', user: 'Rahul Verma' },
        { action: 'Material delivery arrived', time: '5 hours ago', description: '500 bags of cement received.', user: 'System' },
        { action: 'Safety inspection passed', time: '1 day ago', description: 'Monthly safety audit completed with 0 critical issues.', user: 'Neha Gupta' }
      ]
    };
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
