import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Resource, ResourceAllocation } from '../models/resource.model';
import { ResourceDataService } from '../resource-data.service';

@Component({
  selector: 'app-resource-allocation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './resource-allocation.component.html',
  styleUrls: ['./resource-allocation.component.css'],
})
export class ResourceAllocationComponent implements OnInit {
  allocations: ResourceAllocation[] = [];
  availableResources: Resource[] = [];
  projectNames: string[] = [];
  showForm = false;
  form: FormGroup;

  constructor(private data: ResourceDataService, private fb: FormBuilder) {
    this.form = this.fb.group({
      resourceId: ['', Validators.required],
      project: ['', Validators.required],
      allocatedBy: ['', Validators.required],
      allocationDate: ['', Validators.required],
      expectedReturnDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.data.allocations$.subscribe(a => (this.allocations = a));
    this.data.resources$.subscribe(r => (this.availableResources = r.filter(x => x.currentStatus === 'Available')));
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

    const { resourceId, project, allocatedBy, allocationDate, expectedReturnDate } = this.form.value;
    const resource = this.availableResources.find(r => r.resourceId === resourceId);
    if (!resource) return;

    const allocation: ResourceAllocation = {
      allocationId: 'A-' + Math.floor(2000 + Math.random() * 8000),
      resourceId,
      resourceName: resource.resourceName,
      category: resource.category,
      project,
      allocatedBy,
      allocationDate,
      expectedReturnDate,
      actualReturnDate: null,
      allocationStatus: 'Allocated',
    };

    this.data.addAllocation(allocation);
    this.form.reset();
    this.showForm = false;
  }

  markReturned(allocationId: string) {
    this.data.returnAllocation(allocationId);
  }

  statusClass(status: ResourceAllocation['allocationStatus']) {
    return { Allocated: 'blue', Returned: 'gray', Overdue: 'red' }[status];
  }
}
