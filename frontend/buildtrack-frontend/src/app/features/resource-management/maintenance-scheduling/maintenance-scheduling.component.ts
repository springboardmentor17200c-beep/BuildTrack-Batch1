import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MaintenanceRecord } from '../models/resource.model';
import { ResourceDataService } from '../resource-data.service';

@Component({
  selector: 'app-maintenance-scheduling',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance-scheduling.component.html',
  styleUrls: ['./maintenance-scheduling.component.css']
})
export class MaintenanceSchedulingComponent implements OnInit, OnDestroy {
  showModal = false;
  searchText = '';
  selectedType = 'All';

  allRecords: MaintenanceRecord[] = [];
  private sub?: Subscription;

  constructor(
    private location: Location,
    private resourceData: ResourceDataService
  ) {}

  ngOnInit() {
    this.sub = this.resourceData.maintenance$.subscribe(records => {
      this.allRecords = records;
    });
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
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveMaintenance() {
    this.closeModal();
  }
}
