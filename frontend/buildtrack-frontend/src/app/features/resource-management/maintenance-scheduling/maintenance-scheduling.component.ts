import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MaintenanceRecord, Resource } from '../models/resource.model';
import { ResourceDataService } from '../resource-data.service';

@Component({
  selector: 'app-maintenance-scheduling',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './maintenance-scheduling.component.html',
  styleUrls: ['./maintenance-scheduling.component.css']
})
export class MaintenanceSchedulingComponent implements OnInit, OnDestroy {
  showModal = false;
  searchText = '';
  selectedType = 'All';

  allRecords: MaintenanceRecord[] = [];
  availableResources: Resource[] = [];
  private sub?: Subscription;
  maintenanceForm!: FormGroup;

  constructor(
    private location: Location,
    private resourceData: ResourceDataService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  private initForm() {
    this.maintenanceForm = this.fb.group({
      resourceId: ['', Validators.required],
      maintenanceType: ['Preventive', Validators.required],
      maintenanceDate: ['', Validators.required],
      nextMaintenanceDate: [''],
      maintenanceCost: [0, Validators.min(0)],
      servicedBy: ['', Validators.required],
      remarks: ['']
    });
  }

  ngOnInit() {
    this.sub = this.resourceData.maintenance$.subscribe(records => {
      this.allRecords = records;
    });
    this.resourceData.resources$.subscribe(r => this.availableResources = r);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  get filteredRecords() {
    return this.allRecords.filter(r => {
      const matchSearch = !this.searchText || 
        r.resourceId.toLowerCase().includes(this.searchText.toLowerCase()) || 
        (r as any).resourceName?.toLowerCase().includes(this.searchText.toLowerCase());
      const matchType = this.selectedType === 'All' || r.maintenanceType === this.selectedType;
      return matchSearch && matchType;
    });
  }

  goBack(): void {
    this.location.back();
  }

  scheduleMaintenance() {
    this.initForm();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveMaintenance() {
    if (this.maintenanceForm.invalid) {
      alert("Please fill out all required fields.");
      return;
    }
    this.resourceData.addMaintenance(this.maintenanceForm.value);
    this.closeModal();
  }
}
