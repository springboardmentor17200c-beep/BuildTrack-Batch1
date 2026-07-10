import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Resource, ResourceCategory, ResourceStatus } from '../models/resource.model';
import { ResourceDataService } from '../resource-data.service';

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
  statuses: (ResourceStatus | 'All')[] = ['All', 'Available', 'In Use', 'Under Maintenance', 'Idle'];

  constructor(private data: ResourceDataService) {}

  ngOnInit(): void {
    this.data.resources$.subscribe(r => (this.allResources = r));
  }

  get filtered(): Resource[] {
    return this.allResources.filter(r => {
      const matchesSearch =
        !this.search ||
        r.name.toLowerCase().includes(this.search.toLowerCase()) ||
        r.id.toLowerCase().includes(this.search.toLowerCase());
      const matchesCategory = this.categoryFilter === 'All' || r.category === this.categoryFilter;
      const matchesStatus = this.statusFilter === 'All' || r.status === this.statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  statusClass(status: ResourceStatus) {
    return {
      'Available': 'green',
      'In Use': 'blue',
      'Under Maintenance': 'orange',
      'Idle': 'gray',
    }[status];
  }
}
