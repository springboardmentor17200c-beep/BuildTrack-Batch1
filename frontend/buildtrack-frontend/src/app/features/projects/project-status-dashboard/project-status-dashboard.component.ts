import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { } from '../../shared/sidebar/app-sidebar.component';
import { Project, ProjectCategory, ProjectStatus } from '../models/projects.model';
import { ProjectsDataService } from '../projects-data.service';

interface CategorySummary {
  category: ProjectCategory;
  count: number;
  avgProgress: number;
}

@Component({
  selector: 'app-project-status-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-status-dashboard.component.html',
  styleUrls: ['./project-status-dashboard.component.css'],
})
export class ProjectStatusDashboardComponent implements OnInit {
  projects: Project[] = [];
  categorySummaries: CategorySummary[] = [];

  totalProjects = 0;
  planningCount = 0;
  inProgressCount = 0;
  onHoldCount = 0;
  completedCount = 0;

  constructor(private data: ProjectsDataService, private location: Location) {}

  ngOnInit(): void {
    this.data.projects$.subscribe(projects => {
      this.projects = projects;
      this.computeStats();
    });
  }

  private computeStats() {
    this.totalProjects = this.projects.length;
    this.planningCount = this.projects.filter(p => p.status === 'Planning').length;
    this.inProgressCount = this.projects.filter(p => p.status === 'In Progress').length;
    this.onHoldCount = this.projects.filter(p => p.status === 'On Hold').length;
    this.completedCount = this.projects.filter(p => p.status === 'Completed').length;

    const categories = Array.from(new Set(this.projects.map(p => p.category)));
    this.categorySummaries = categories.map(category => {
      const items = this.projects.filter(p => p.category === category);
      const progresses = items.map(p => this.data.getProgress(p.projectId));
      return {
        category,
        count: items.length,
        avgProgress: progresses.length ? Math.round(progresses.reduce((s, v) => s + v, 0) / progresses.length) : 0,
      };
    });
  }

  progress(projectId: string): number {
    return this.data.getProgress(projectId);
  }

  statusClass(status: ProjectStatus) {
    return { Planning: 'gray', 'In Progress': 'blue', 'On Hold': 'orange', Completed: 'green' }[status];
  }

  goBack(): void {
    this.location.back();
  }
}
