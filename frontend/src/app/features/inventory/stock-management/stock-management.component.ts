import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { InventoryDataService } from '../inventory-data.service';
import { InventoryRecord, Material } from '../models/inventory.model';

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './stock-management.component.html',
  styleUrls: ['./stock-management.component.css']
})
export class StockManagementComponent implements OnInit, OnDestroy {
  materials: Material[] = [];
  inventoryRecords: InventoryRecord[] = [];
  showAddForm = false;
  showEditForm = false;
  selectedMaterial: Material | null = null;
  
  addForm: FormGroup;
  editForm: FormGroup;
  private subscriptions = new Subscription();

  categories = [
    'Cement', 'Steel', 'Bricks', 'Sand', 
    'Concrete', 'Electrical Materials', 'Plumbing Materials'
  ];

  constructor(
    private data: InventoryDataService,
    private fb: FormBuilder,
    private location: Location
  ) {
    this.addForm = this.fb.group({
      materialName: ['', Validators.required],
      category: ['', Validators.required],
      unitOfMeasure: ['', Validators.required],
      description: [''],
      quantity: ['', [Validators.required, Validators.min(0)]],
      minimumStockLevel: ['', [Validators.required, Validators.min(0)]],
      storageLocation: ['', Validators.required]
    });

    this.editForm = this.fb.group({
      materialName: ['', Validators.required],
      category: ['', Validators.required],
      unitOfMeasure: ['', Validators.required],
      description: [''],
      minimumStockLevel: ['', [Validators.required, Validators.min(0)]],
      storageLocation: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.data.materials$.subscribe(m => (this.materials = m))
    );
    this.subscriptions.add(
      this.data.inventory$.subscribe(inv => (this.inventoryRecords = inv))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.addForm.reset();
    }
  }

  addMaterial() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const { materialName, category, unitOfMeasure, description, quantity, minimumStockLevel, storageLocation } = this.addForm.value;

    // Add to materials catalog
    this.data.addMaterial({
      materialName,
      category,
      unitOfMeasure,
      description
    });

    // Find the newly added material
    setTimeout(() => {
      const newMaterial = this.materials.find(m => m.materialName === materialName);
      if (newMaterial) {
        // Add inventory record
        this.data.addInventoryRecord({
          materialId: newMaterial.materialId,
          materialName: newMaterial.materialName,
          category: newMaterial.category,
          unitOfMeasure: newMaterial.unitOfMeasure,
          availableQuantity: quantity,
          minimumStockLevel: minimumStockLevel,
          storageLocation: storageLocation
        });
      }
    }, 100);

    this.addForm.reset();
    this.showAddForm = false;
  }

  editMaterial(material: Material) {
    this.selectedMaterial = material;
    const record = this.getInventoryRecord(material.materialId);
    this.editForm.patchValue({
      materialName: material.materialName,
      category: material.category,
      unitOfMeasure: material.unitOfMeasure,
      description: material.description || '',
      minimumStockLevel: record?.minimumStockLevel || 0,
      storageLocation: record?.storageLocation || ''
    });
    this.showEditForm = true;
  }

  updateMaterial() {
    if (this.editForm.invalid || !this.selectedMaterial) {
      this.editForm.markAllAsTouched();
      return;
    }

    const { materialName, category, unitOfMeasure, description, minimumStockLevel, storageLocation } = this.editForm.value;

    // Update material catalog
    this.data.updateMaterial(this.selectedMaterial.materialId, {
      materialName,
      category,
      unitOfMeasure,
      description
    });

    // Update inventory record
    const record = this.getInventoryRecord(this.selectedMaterial.materialId);
    if (record) {
      this.data.updateInventoryRecord(record.inventoryId, {
        minimumStockLevel,
        storageLocation
      });
    }

    this.showEditForm = false;
    this.selectedMaterial = null;
    this.editForm.reset();
  }

  deleteMaterial(materialId: string) {
    if (confirm('Are you sure you want to delete this material?')) {
      this.data.deleteMaterial(materialId);
    }
  }

  getInventoryRecord(materialId: string): InventoryRecord | undefined {
    return this.inventoryRecords.find(inv => inv.materialId === materialId);
  }

  getStockStatus(record: InventoryRecord | undefined): string {
    if (!record) return 'Out of Stock';
    return this.data.getStockStatus(record);
  }

  goBack(): void {
    this.location.back();
  }
}