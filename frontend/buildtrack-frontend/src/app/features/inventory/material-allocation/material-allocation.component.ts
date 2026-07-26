import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { InventoryDataService } from '../inventory-data.service';
import { MaterialAllocation, InventoryRecord } from '../models/inventory.model';

@Component({
  selector: 'app-material-allocation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './material-allocation.component.html',
  styleUrls: ['./material-allocation.component.css']
})
export class MaterialAllocationComponent implements OnInit, OnDestroy {
  allocations: MaterialAllocation[] = [];
  inventoryRecords: InventoryRecord[] = [];
  showForm = false;
  form: FormGroup;
  private subscriptions = new Subscription();

  projects = [
    { id: 'Skyline Residency Tower', name: 'Skyline Residency Tower' },
    { id: 'Riverside Business Park', name: 'Riverside Business Park' }
  ];

  constructor(
    private data: InventoryDataService,
    private fb: FormBuilder,
    private location: Location
  ) {
    this.form = this.fb.group({
      materialId: ['', Validators.required],
      projectId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      allocatedBy: ['', Validators.required],
      issuedTo: ['', Validators.required],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.data.allocations$.subscribe(a => (this.allocations = a))
    );
    this.subscriptions.add(
      this.data.inventory$.subscribe(inv => (this.inventoryRecords = inv))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.form.reset();
    }
  }

  getAvailableQuantity(materialId: string): number {
    return this.data.getAvailableForAllocation(materialId);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { materialId, projectId, quantity, allocatedBy, issuedTo, remarks } = this.form.value;
    const material = this.inventoryRecords.find(inv => inv.materialId === materialId);

    if (!material) return;

    const available = this.getAvailableQuantity(materialId);
    if (quantity > available) {
      alert(`Insufficient stock. Available: ${available} ${material.unitOfMeasure}`);
      return;
    }

    this.data.createAllocation({
      materialId: material.materialId,
      materialName: material.materialName,
      projectId: projectId,
      projectName: projectId,
      allocatedQuantity: quantity,
      allocatedBy: allocatedBy,
      issuedTo: issuedTo,
      remarks: remarks
    });

    this.form.reset();
    this.showForm = false;
  }

  issueAllocation(allocationId: string) {
    if (confirm('Issue this material to the project?')) {
      this.data.issueAllocation(allocationId);
    }
  }

  returnAllocation(allocationId: string) {
    const allocation = this.allocations.find(a => a.allocationId === allocationId);
    if (!allocation) return;
    
    const remaining = allocation.allocatedQuantity - (allocation.returnedQuantity || 0);
    const quantity = prompt(`Enter quantity to return (Max: ${remaining}):`);
    if (quantity) {
      const returnQty = Number(quantity);
      if (returnQty > 0 && returnQty <= remaining) {
        this.data.returnAllocation(allocationId, returnQty);
      } else {
        alert('Invalid quantity');
      }
    }
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'Reserved': 'orange',
      'Issued': 'green',
      'Returned': 'blue',
      'PartiallyReturned': 'orange'
    };
    return map[status] || 'gray';
  }

  goBack(): void {
    this.location.back();
  }
}