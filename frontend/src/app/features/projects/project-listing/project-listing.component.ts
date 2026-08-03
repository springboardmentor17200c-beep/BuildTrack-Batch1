import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSidebarComponent } from '../../shared/sidebar/app-sidebar.component';
import { Project, ProjectCategory, ProjectStatus } from '../models/projects.model';
import { ProjectsDataService } from '../projects-data.service';

@Component({
  selector: 'app-project-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, AppSidebarComponent],
  templateUrl: './project-listing.component.html',
  styleUrls: ['./project-listing.component.css'],
})
export class ProjectListingComponent implements OnInit {
  allProjects: Project[] = [];
  search = '';
  categoryFilter: ProjectCategory | 'All' = 'All';
  statusFilter: ProjectStatus | 'All' = 'All';

  categories: (ProjectCategory | 'All')[] = [
    'All',
    'Residential',
    'Commercial',
    'Industrial',
    'Infrastructure',
    'Government',
  ];
  statuses: (ProjectStatus | 'All')[] = ['All', 'Planning', 'In Progress', 'On Hold', 'Completed'];

  showForm = false;
  form: FormGroup;

  constructor(
    private data: ProjectsDataService,
    private fb: FormBuilder,
    private location: Location,
  ) {
    this.form = this.fb.group({
      projectName: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      category: ['', Validators.required],
      manager: ['', Validators.required],
      client: ['', Validators.required],
      startDate: ['', Validators.required],
      expectedEndDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.data.projects$.subscribe((p) => (this.allProjects = p));
  }

  get filtered(): Project[] {
    return this.allProjects.filter((p) => {
      const matchesSearch =
        !this.search || p.projectName.toLowerCase().includes(this.search.toLowerCase());
      const matchesCategory = this.categoryFilter === 'All' || p.category === this.categoryFilter;
      const matchesStatus = this.statusFilter === 'All' || p.status === this.statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  progress(projectId: string): number {
    return this.data.getProgress(projectId);
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const project: Project = {
      projectId: 'P-' + Math.floor(100 + Math.random() * 900),
      status: 'Planning',
      actualEndDate: null,
      ...this.form.value,
    };

    this.data.addProject(project);
    this.form.reset();
    this.showForm = false;
  }

  statusClass(status: ProjectStatus) {
    return { Planning: 'gray', 'In Progress': 'blue', 'On Hold': 'orange', Completed: 'green' }[
      status
    ];
  }

  goBack(): void {
    this.location.back();
  }
}
