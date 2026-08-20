import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Resource, ResourceCategory, ResourceStatus } from '../models/resource.model';
import { ResourceDataService } from '../resource-data.service';
import { } from '../../shared/sidebar/app-sidebar.component';


@Component({
  selector: 'app-equipment-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './equipment-tracking.component.html',
  styleUrls: ['./equipment-tracking.component.css'],
})
export class EquipmentTrackingComponent implements OnInit {
  allResources: Resource[] = [];
  search = '';
  categoryFilter: ResourceCategory | 'All' = 'All';
  statusFilter: ResourceStatus | 'All' = 'All';

  categories: (ResourceCategory | 'All')[] = [
    'All', 'Excavators', 'Concrete Mixers', 'Cranes', 'Dump Trucks', 'Generators', 'Safety Equipment',
  ];
  statuses: (ResourceStatus | 'All')[] = ['All', 'Available', 'Allocated', 'Under Maintenance'];

  constructor(private data: ResourceDataService, private location: Location) {}

  ngOnInit(): void {
    this.data.resources$.subscribe(r => (this.allResources = r));
  }

  get filtered(): Resource[] {
    return this.allResources.filter(r => {
      const matchesSearch =
        !this.search ||
        r.resourceName.toLowerCase().includes(this.search.toLowerCase()) ||
        r.resourceId.toLowerCase().includes(this.search.toLowerCase()) ||
        r.serialNumber.toLowerCase().includes(this.search.toLowerCase());
      const matchesCategory = this.categoryFilter === 'All' || r.category === this.categoryFilter;
      const matchesStatus = this.statusFilter === 'All' || r.currentStatus === this.statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  assignedProject(resourceId: string): string | null {
    return this.data.getAssignedProject(resourceId);
  }

  lastMaintenance(resourceId: string): string | null {
    return this.data.getLastMaintenanceDate(resourceId);
  }

  nextMaintenance(resourceId: string): string | null {
    return this.data.getNextMaintenanceDate(resourceId);
  }

  statusClass(status: ResourceStatus) {
    return {
      'Available': 'green',
      'Allocated': 'blue',
      'Under Maintenance': 'orange',
    }[status];
  }

  goBack(): void {
    this.location.back();
  }
}
