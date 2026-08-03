import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppSidebarComponent } from '../../shared/sidebar/app-sidebar.component';
import { Project, ProjectMilestone, ProjectStatus } from '../models/projects.model';
import { ProjectsDataService } from '../projects-data.service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule, AppSidebarComponent],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
})
export class ProjectDetailsComponent implements OnInit {
  project: Project | undefined;
  milestones: ProjectMilestone[] = [];
  progress = 0;

  statusOptions: ProjectStatus[] = ['Planning', 'In Progress', 'On Hold', 'Completed'];

  constructor(
    private route: ActivatedRoute,
    private data: ProjectsDataService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.project = this.data.getProjectById(id);
    this.progress = this.data.getProgress(id);

    this.data.milestones$.subscribe(all => {
      this.milestones = all.filter(m => m.projectId === id);
    });
  }

  setStatus(status: ProjectStatus) {
    if (!this.project) return;
    this.data.updateProjectStatus(this.project.projectId, status);
    this.project = { ...this.project, status, actualEndDate: status === 'Completed' ? '2026-07-12' : this.project.actualEndDate };
  }

  statusClass(status: ProjectStatus) {
    return { Planning: 'gray', 'In Progress': 'blue', 'On Hold': 'orange', Completed: 'green' }[status];
  }

  milestoneStatusClass(status: ProjectMilestone['status']) {
    return { Pending: 'gray', 'In Progress': 'blue', Completed: 'green' }[status];
  }

  goBack(): void {
    this.location.back();
  }
}
