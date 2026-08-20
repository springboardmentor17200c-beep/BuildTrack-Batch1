import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { } from '../../shared/sidebar/app-sidebar.component';
import { Project, ProjectCategory, ProjectStatus } from '../models/projects.model';
import { ProjectsDataService, ProjectCategory as ApiCategory, ProjectStatusOption } from '../projects-data.service';
import { AuthDataService } from '../../auth/auth-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-listing.component.html',
  styleUrls: ['./project-listing.component.css'],
})
export class ProjectListingComponent implements OnInit, OnDestroy {
  allProjects: Project[] = [];
  search = '';
  categoryFilter: ProjectCategory | 'All' = 'All';
  statusFilter: ProjectStatus | 'All' = 'All';

  // Static filter options for the filter bar
  categories: (ProjectCategory | 'All')[] = ['All', 'Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Government'];
  statuses: (ProjectStatus | 'All')[] = ['All', 'Planning', 'In Progress', 'On Hold', 'Completed'];

  // DB-backed dropdown options for the create form
  dbCategories: ApiCategory[] = [];
  dbStatuses: ProjectStatusOption[] = [];

  showForm = false;
  submitting = false;
  submitError = '';
  form: FormGroup;

  private subs = new Subscription();

  constructor(
    private data: ProjectsDataService,
    private auth: AuthDataService,
    private fb: FormBuilder,
    private location: Location
  ) {
    this.form = this.fb.group({
      projectName:     ['', Validators.required],
      description:     ['', Validators.required],
      location:        ['', Validators.required],
      category:        ['', Validators.required],
      startDate:       ['', Validators.required],
      expectedEndDate: ['', Validators.required],
      manager:         ['', Validators.required],
      client:          ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.subs.add(this.data.projects$.subscribe(p => (this.allProjects = p)));
    this.subs.add(this.data.categories$.subscribe(c => (this.dbCategories = c)));
    this.subs.add(this.data.statuses$.subscribe(s => (this.dbStatuses = s)));
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  get filtered(): Project[] {
    return this.allProjects.filter(p => {
      const matchesSearch   = !this.search || p.projectName.toLowerCase().includes(this.search.toLowerCase());
      const matchesCategory = this.categoryFilter === 'All' || p.category === this.categoryFilter;
      const matchesStatus   = this.statusFilter === 'All' || p.status === this.statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  progress(projectId: string): number { return this.data.getProgress(projectId); }

  toggleForm() {
    this.showForm = !this.showForm;
    this.submitError = '';
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const user = this.auth.currentUser;
    if (!user) { this.submitError = 'You must be logged in.'; return; }

    const managerId = parseInt(user.userId, 10);
    const companyId = user.companyId ?? 1;

    const planningStatus = this.dbStatuses.find(s => s.status_name === 'Planning');
    if (!planningStatus) {
      this.submitError = 'Status lookup not loaded yet — please wait a moment and try again.';
      return;
    }

    this.submitting = true;
    this.submitError = '';

    this.data.createProject({
      projectName:     this.form.value.projectName,
      description:     this.form.value.description,
      location:        this.form.value.location,
      categoryName:    this.form.value.category,
      statusName:      'Planning',
      managerName:     this.form.value.manager,
      clientName:      this.form.value.client,
      startDate:       this.form.value.startDate,
      expectedEndDate: this.form.value.expectedEndDate,
      companyId,
      managerId,
      clientId: managerId,
    }).subscribe({
      next: (result) => {
        this.submitting = false;
        if (result !== null) {
          this.form.reset();
          this.showForm = false;
        } else {
          this.submitError = 'Failed to save project. Check the console for details.';
        }
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.detail ?? 'Failed to save project.';
      },
    });
  }

  statusClass(status: ProjectStatus) {
    return { Planning: 'gray', 'In Progress': 'blue', 'On Hold': 'orange', Completed: 'green' }[status];
  }

  goBack(): void { this.location.back(); }
}
