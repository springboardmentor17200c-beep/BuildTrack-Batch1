import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryRecord, Material, MaterialRequest } from '../models/inventory.model';
import { InventoryDataService } from '../inventory-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-material-requests',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './material-requests.component.html',  // ← Must match file name
  styleUrls: ['./material-requests.component.css'],  // ← Must match file name
})
export class MaterialRequestsComponent implements OnInit, OnDestroy {
  requests: MaterialRequest[] = [];
  materials: Material[] = [];
  inventoryRecords: InventoryRecord[] = [];
  projectNames: string[] = [];
  showForm = false;
  form: FormGroup;
  private subscriptions = new Subscription();

  constructor(private data: InventoryDataService, private fb: FormBuilder, private location: Location) {
    this.form = this.fb.group({
      materialId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      project: ['', Validators.required],
      requestedBy: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.data.requests$.subscribe(r => (this.requests = r))
    );
    this.subscriptions.add(
      this.data.materials$.subscribe(m => (this.materials = m))
    );
    this.subscriptions.add(
      this.data.inventory$.subscribe(inv => (this.inventoryRecords = inv))
    );
    this.projectNames = this.data.projectNames;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    const material = this.materials.find(m => m.materialId === materialId);
    if (!material) return;

    const request: MaterialRequest = {
      requestId: 'MR-' + Math.floor(3000 + Math.random() * 9000),
      project,
      requestedBy,
      materialId,
      materialName: material.materialName,
      category: material.category,
      unitOfMeasure: material.unitOfMeasure,
      requestedQuantity: Number(quantity),
      requestDate: new Date().toISOString().split('T')[0],
      requestStatus: 'Pending',
    };

    this.data.addMaterialRequest(request);
    this.form.reset();
    this.showForm = false;
  }

  canApprove(request: MaterialRequest): boolean {
    return this.data.hasSufficientStock(request.materialId, request.requestedQuantity);
  }

  approve(request: MaterialRequest) {
    this.data.approveRequest(request.requestId);
  }

  reject(request: MaterialRequest) {
    this.data.rejectRequest(request.requestId);
  }

  statusClass(status: MaterialRequest['requestStatus']) {
    return { Pending: 'orange', Approved: 'green', Rejected: 'red' }[status];
  }

  goBack(): void {
    this.location.back();
  }
}