import { CommonModule, Location } from '@angular/common';
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
import { DUMMY_PROJECTS, Project, ProjectStatus } from '../projects/projects';
import { ProjectForm } from '../projects/components/project-form/project-form';

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
    ProjectForm
  ],
  templateUrl: './project-details.html',
  styleUrl: './project-details.css',
})
export class ProjectDetails implements OnInit {
  projectData = signal<ProjectDetailsResponse | null>(null);
  error = signal<string | null>(null);
  
  isEditModalOpen = signal(false);
  editingProject = signal<any | null>(null);
  
  currentProjectRef: Project | null = null;

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
  private readonly location = inject(Location);

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

        this.currentProjectRef = found;
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
    const state = this.location.getState() as any;
    if (state && state.fromProjects) {
      this.location.back();
    } else {
      this.router.navigate(['/projects'], { replaceUrl: true });
    }
  }
  
  openEditModal(): void {
    if (!this.currentProjectRef) return;
    const project = this.currentProjectRef;
    
    // Map project data to form structure for editing
    const editData = {
      ...project,
      budget: project.budgetTotal, 
      endDate: project.endDate || (project.deadline ? this.parseDateToInput(project.deadline) : '')
    };
    
    this.editingProject.set(editData);
    this.isEditModalOpen.set(true);
  }
  
  parseDateToInput(dateStr: string): string {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
      const d = parts[0].padStart(2, '0');
      const m = (months.indexOf(parts[1]) + 1).toString().padStart(2, '0');
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
    return '';
  }
  
  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.editingProject.set(null);
  }
  
  onProjectUpdate(formData: any): void {
    if (!this.currentProjectRef) return;
    
    let progress = this.currentProjectRef.progress;
    if (formData.status === 'Completed') {
      progress = 100;
    }
    
    // Update the ref
    Object.assign(this.currentProjectRef, {
      ...formData,
      budgetTotal: formData.budget,
      deadline: formData.endDate ? this.formatDate(formData.endDate) : this.currentProjectRef.deadline,
      progress
    });
    
    // Refresh view
    this.projectData.set(this.buildDummyDetails(this.currentProjectRef));
    this.closeEditModal();
  }
  
  formatDate(dateStr: string): string {
    if (dateStr && dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
    }
    return dateStr;
  }
  
  confirmCloseProject(): void {
    if (!this.currentProjectRef) return;
    
    const confirm = window.confirm("Are you sure you want to close this project?");
    if (confirm) {
      // Mark as closed/completed
      this.currentProjectRef.status = 'Completed' as ProjectStatus;
      this.currentProjectRef.progress = 100;
      // Mark completion date
      const today = new Date();
      this.currentProjectRef.deadline = this.formatDate(`${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`);
      
      // Refresh view
      this.projectData.set(this.buildDummyDetails(this.currentProjectRef));
      
      // Success message
      window.alert("Project closed successfully.");
    }
  }
}
