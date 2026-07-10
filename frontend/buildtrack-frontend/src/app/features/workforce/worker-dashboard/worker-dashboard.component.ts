import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Worker, WorkforceCategory, WorkerStatus } from '../models/workforce.model';
import { WorkforceDataService } from '../workforce-data.service';

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
  workers: Worker[] = [];
  categorySummaries: CategorySummary[] = [];

  totalWorkers = 0;
  activeCount = 0;
  onLeaveCount = 0;
  inactiveCount = 0;

  search = '';
  categoryFilter: WorkforceCategory | 'All' = 'All';
  categories: (WorkforceCategory | 'All')[] = [
    'All', 'Engineers', 'Supervisors', 'Contractors', 'Skilled Workers', 'Unskilled Workers', 'Consultants',
  ];

  showForm = false;
  form: FormGroup;
  projectNames: string[] = [];

  constructor(private data: WorkforceDataService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      project: ['', Validators.required],
      contact: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.data.workers$.subscribe(w => {
      this.workers = w;
      this.computeStats();
    });
    this.projectNames = this.data.projectNames;
  }

  private computeStats() {
    this.totalWorkers = this.workers.length;
    this.activeCount = this.workers.filter(w => w.status === 'Active').length;
    this.onLeaveCount = this.workers.filter(w => w.status === 'On Leave').length;
    this.inactiveCount = this.workers.filter(w => w.status === 'Inactive').length;

    const categories = Array.from(new Set(this.workers.map(w => w.category)));
    this.categorySummaries = categories.map(category => {
      const items = this.workers.filter(w => w.category === category);
      return {
        category,
        count: items.length,
        active: items.filter(w => w.status === 'Active').length,
      };
    });
  }

  get filtered(): Worker[] {
    return this.workers.filter(w => {
      const matchesSearch = !this.search || w.name.toLowerCase().includes(this.search.toLowerCase()) || w.id.toLowerCase().includes(this.search.toLowerCase());
      const matchesCategory = this.categoryFilter === 'All' || w.category === this.categoryFilter;
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

    const { name, category, project, contact } = this.form.value;
    const worker: Worker = {
      id: 'W-' + Math.floor(400 + Math.random() * 600),
      name,
      category,
      status: 'Active',
      project,
      contact,
      joinDate: new Date().toISOString().slice(0, 10),
    };

    this.data.addWorker(worker);
    this.form.reset();
    this.showForm = false;
  }

  statusClass(status: Worker['status']) {
    return { Active: 'green', 'On Leave': 'orange', Inactive: 'gray' }[status];
  }
}
