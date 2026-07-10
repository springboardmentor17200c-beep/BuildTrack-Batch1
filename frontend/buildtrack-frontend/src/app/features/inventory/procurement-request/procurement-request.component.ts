import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialItem, ProcurementRequest } from '../models/inventory.model';
import { InventoryDataService } from '../inventory-data.service';

@Component({
  selector: 'app-procurement-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './procurement-request.component.html',
  styleUrls: ['./procurement-request.component.css'],
})
export class ProcurementRequestComponent implements OnInit {
  requests: ProcurementRequest[] = [];
  materials: MaterialItem[] = [];
  projectNames: string[] = [];
  showForm = false;
  form: FormGroup;

  constructor(private data: InventoryDataService, private fb: FormBuilder) {
    this.form = this.fb.group({
      materialId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      project: ['', Validators.required],
      requestedBy: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.data.requests$.subscribe(r => (this.requests = r));
    this.data.materials$.subscribe(m => (this.materials = m));
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

    const { materialId, quantity, project, requestedBy } = this.form.value;
    const material = this.materials.find(m => m.id === materialId);
    if (!material) return;

    const request: ProcurementRequest = {
      id: 'PR-' + Math.floor(3000 + Math.random() * 9000),
      materialId,
      materialName: material.name,
      category: material.category,
      quantity: Number(quantity),
      unit: material.unit,
      project,
      requestedBy,
      requestDate: new Date().toISOString().slice(0, 10),
      status: 'Pending',
    };

    this.data.addRequest(request);
    this.form.reset();
    this.showForm = false;
  }

  advance(request: ProcurementRequest) {
    const next: Record<ProcurementRequest['status'], ProcurementRequest['status']> = {
      Pending: 'Approved',
      Approved: 'Delivered',
      Delivered: 'Delivered',
      Rejected: 'Rejected',
    };
    this.data.updateRequestStatus(request.id, next[request.status]);
  }

  reject(request: ProcurementRequest) {
    this.data.updateRequestStatus(request.id, 'Rejected');
  }

  statusClass(status: ProcurementRequest['status']) {
    return { Pending: 'orange', Approved: 'blue', Delivered: 'green', Rejected: 'red' }[status];
  }
}
