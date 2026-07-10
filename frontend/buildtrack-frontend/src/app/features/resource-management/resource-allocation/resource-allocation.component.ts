import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Allocation, Resource } from '../models/resource.model';
import { ResourceDataService } from '../resource-data.service';

@Component({
  selector: 'app-resource-allocation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './resource-allocation.component.html',
  styleUrls: ['./resource-allocation.component.css'],
})
export class ResourceAllocationComponent implements OnInit {
  allocations: Allocation[] = [];
  availableResources: Resource[] = [];
  projectNames: string[] = [];
  showForm = false;
  form: FormGroup;

  constructor(private data: ResourceDataService, private fb: FormBuilder) {
    this.form = this.fb.group({
      resourceId: ['', Validators.required],
      project: ['', Validators.required],
      allocatedTo: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.data.allocations$.subscribe(a => (this.allocations = a));
    this.data.resources$.subscribe(r => (this.availableResources = r.filter(x => x.status === 'Available')));
    this.projectNames = this.data.projectNames;
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { resourceId, project, allocatedTo, startDate, endDate } = this.form.value;
    const resource = this.availableResources.find(r => r.id === resourceId);
    if (!resource) return;

    const allocation: Allocation = {
      id: 'A-' + Math.floor(2000 + Math.random() * 8000),
      resourceId,
      resourceName: resource.name,
      category: resource.category,
      project,
      allocatedTo,
      startDate,
      endDate,
      status: 'Scheduled',
    };

    this.data.addAllocation(allocation, resourceId);
    this.form.reset();
    this.showForm = false;
  }

  remove(id: string) {
    this.data.deleteAllocation(id);
  }

  statusClass(status: Allocation['status']) {
    return { Active: 'green', Scheduled: 'blue', Completed: 'gray' }[status];
  }
}
