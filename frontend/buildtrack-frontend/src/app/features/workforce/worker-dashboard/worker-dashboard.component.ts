import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { Employee, WorkforceCategory } from '../models/workforce.model';
import { WorkforceDataService } from '../workforce-data.service';
import { ProjectsDataService } from '../../projects/projects-data.service';
import { } from '../../shared/sidebar/app-sidebar.component';


interface CategorySummary {
  category: WorkforceCategory;
  count: number;
  active: number;
}

@Component({
  selector: 'app-worker-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './worker-dashboard.component.html',
  styleUrls: ['./worker-dashboard.component.css'],
})
export class WorkerDashboardComponent implements OnInit {
  employees: Employee[] = [];
  categorySummaries: CategorySummary[] = [];

  totalEmployees = 0;
  activeCount = 0;
  onLeaveCount = 0;
  terminatedCount = 0;

  search = '';
  categoryFilter: WorkforceCategory | 'All' = 'All';
  categories: (WorkforceCategory | 'All')[] = [
    'All', 'Engineers', 'Supervisors', 'Contractors', 'Skilled Workers', 'Unskilled Workers', 'Consultants',
  ];

  showForm = false;
  form: FormGroup;
  projectNames: string[] = [];

  constructor(private data: WorkforceDataService, private projectsData: ProjectsDataService, private fb: FormBuilder, private location: Location) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      employeeCode: ['', Validators.required],
      workforceCategory: ['', Validators.required],
      project: ['', Validators.required],
      contact: ['', Validators.required],
      experienceYears: ['', [Validators.required, Validators.min(0)]],
      payRate: ['', [Validators.required, Validators.min(0)]],
      paymentType: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.data.employees$.subscribe(e => {
      this.employees = e;
      this.computeStats();
    });
    this.projectsData.projects$.subscribe(projs => {
      this.projectNames = projs.map(p => p.projectName);
    });
  }

  private computeStats() {
    this.totalEmployees = this.employees.length;
    this.activeCount = this.employees.filter(e => e.employmentStatus === 'Active').length;
    this.onLeaveCount = this.employees.filter(e => e.employmentStatus === 'On Leave').length;
    this.terminatedCount = this.employees.filter(e => e.employmentStatus === 'Terminated').length;

    const categories = Array.from(new Set(this.employees.map(e => e.workforceCategory)));
    this.categorySummaries = categories.map(category => {
      const items = this.employees.filter(e => e.workforceCategory === category);
      return {
        category,
        count: items.length,
        active: items.filter(e => e.employmentStatus === 'Active').length,
      };
    });
  }

  get filtered(): Employee[] {
    return this.employees.filter(e => {
      const matchesSearch = !this.search || e.fullName.toLowerCase().includes(this.search.toLowerCase()) || e.employeeCode.toLowerCase().includes(this.search.toLowerCase());
      const matchesCategory = this.categoryFilter === 'All' || e.workforceCategory === this.categoryFilter;
      return matchesSearch && matchesCategory;
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

    const employee: Employee = {
      employeeId: 'E-' + Math.floor(400 + Math.random() * 600),
      employmentStatus: 'Active',
      joiningDate: new Date().toISOString().slice(0, 10),
      ...this.form.value,
    };

    this.data.addEmployee(employee);
    this.form.reset();
    this.showForm = false;
  }

  statusClass(status: Employee['employmentStatus']) {
    return { Active: 'green', 'On Leave': 'orange', Terminated: 'gray' }[status];
  }

  goBack(): void {
    this.location.back();
  }
}
