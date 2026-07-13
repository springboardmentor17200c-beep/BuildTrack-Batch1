import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppSidebarComponent } from '../../shared/sidebar/app-sidebar.component';
import { MilestoneStatus, Project, ProjectMilestone } from '../models/projects.model';
import { ProjectsDataService } from '../projects-data.service';

@Component({
  selector: 'app-milestone-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, AppSidebarComponent],
  templateUrl: './milestone-tracking.component.html',
  styleUrls: ['./milestone-tracking.component.css'],
})
export class MilestoneTrackingComponent implements OnInit {
  allMilestones: ProjectMilestone[] = [];
  projects: Project[] = [];
  projectFilter = 'All';
  statusFilter: MilestoneStatus | 'All' = 'All';

  statuses: (MilestoneStatus | 'All')[] = ['All', 'Pending', 'In Progress', 'Completed'];

  showForm = false;
  form: FormGroup;

  constructor(
    private data: ProjectsDataService,
    private fb: FormBuilder,
    private location: Location
  ) {
    this.form = this.fb.group({
      projectId: ['', Validators.required],
      milestoneName: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.data.milestones$.subscribe(m => (this.allMilestones = m));
    this.data.projects$.subscribe(p => (this.projects = p));
  }

  get filtered(): ProjectMilestone[] {
    return this.allMilestones.filter(m => {
      const matchesProject = this.projectFilter === 'All' || m.projectId === this.projectFilter;
      const matchesStatus = this.statusFilter === 'All' || m.status === this.statusFilter;
      return matchesProject && matchesStatus;
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { projectId, milestoneName, description, dueDate } = this.form.value;
    const project = this.projects.find(p => p.projectId === projectId);
    if (!project) return;

    const milestone: ProjectMilestone = {
      milestoneId: 'M-' + Math.floor(100 + Math.random() * 900),
      projectId,
      projectName: project.projectName,
      milestoneName,
      description,
      dueDate,
      completionDate: null,
      status: 'Pending',
    };

    this.data.addMilestone(milestone);
    this.form.reset();
    this.showForm = false;
  }

  markComplete(milestone: ProjectMilestone) {
    this.data.markMilestoneStatus(milestone.milestoneId, 'Completed');
  }

  markInProgress(milestone: ProjectMilestone) {
    this.data.markMilestoneStatus(milestone.milestoneId, 'In Progress');
  }

  statusClass(status: MilestoneStatus) {
    return { Pending: 'gray', 'In Progress': 'blue', Completed: 'green' }[status];
  }

  goBack(): void {
    this.location.back();
  }
}
