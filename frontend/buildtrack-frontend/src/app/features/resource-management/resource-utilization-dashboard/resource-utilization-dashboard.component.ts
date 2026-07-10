import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Resource, ResourceCategory } from '../models/resource.model';
import { ResourceDataService } from '../resource-data.service';

interface CategorySummary {
  category: ResourceCategory;
  avgUtilization: number;
  total: number;
  inUse: number;
}

@Component({
  selector: 'app-resource-utilization-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resource-utilization-dashboard.component.html',
  styleUrls: ['./resource-utilization-dashboard.component.css'],
})
export class ResourceUtilizationDashboardComponent implements OnInit {
  resources: Resource[] = [];
  categorySummaries: CategorySummary[] = [];

  totalAssets = 0;
  inUseCount = 0;
  availableCount = 0;
  maintenanceCount = 0;
  avgUtilization = 0;

  constructor(private data: ResourceDataService) {}

  ngOnInit(): void {
    this.data.resources$.subscribe(r => {
      this.resources = r;
      this.computeStats();
    });
  }

  private computeStats() {
    this.totalAssets = this.resources.length;
    this.inUseCount = this.resources.filter(r => r.status === 'In Use').length;
    this.availableCount = this.resources.filter(r => r.status === 'Available').length;
    this.maintenanceCount = this.resources.filter(r => r.status === 'Under Maintenance').length;
    this.avgUtilization = this.totalAssets
      ? Math.round(this.resources.reduce((sum, r) => sum + r.utilization, 0) / this.totalAssets)
      : 0;

    const categories = Array.from(new Set(this.resources.map(r => r.category)));
    this.categorySummaries = categories.map(category => {
      const items = this.resources.filter(r => r.category === category);
      const avgUtilization = Math.round(items.reduce((s, r) => s + r.utilization, 0) / items.length);
      return {
        category,
        avgUtilization,
        total: items.length,
        inUse: items.filter(r => r.status === 'In Use').length,
      };
    }).sort((a, b) => b.avgUtilization - a.avgUtilization);
  }
}
