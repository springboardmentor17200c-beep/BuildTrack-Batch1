import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
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

  constructor(private data: ResourceDataService, private location: Location) {}

  ngOnInit(): void {
    this.data.resources$.subscribe(r => {
      this.resources = r;
      this.computeStats();
    });
    // recompute if allocation history changes too (utilization depends on it)
    this.data.allocations$.subscribe(() => this.computeStats());
  }

  private computeStats() {
    this.totalAssets = this.resources.length;
    this.inUseCount = this.resources.filter(r => r.currentStatus === 'Allocated').length;
    this.availableCount = this.resources.filter(r => r.currentStatus === 'Available').length;
    this.maintenanceCount = this.resources.filter(r => r.currentStatus === 'Under Maintenance').length;

    const utilizations = this.resources.map(r => this.data.getUtilization(r.resourceId));
    this.avgUtilization = utilizations.length
      ? Math.round(utilizations.reduce((s, v) => s + v, 0) / utilizations.length)
      : 0;

    const categories = Array.from(new Set(this.resources.map(r => r.category)));
    this.categorySummaries = categories.map(category => {
      const items = this.resources.filter(r => r.category === category);
      const itemUtilizations = items.map(r => this.data.getUtilization(r.resourceId));
      const avgUtilization = itemUtilizations.length
        ? Math.round(itemUtilizations.reduce((s, v) => s + v, 0) / itemUtilizations.length)
        : 0;
      return {
        category,
        avgUtilization,
        total: items.length,
        inUse: items.filter(r => r.currentStatus === 'Allocated').length,
      };
    }).sort((a, b) => b.avgUtilization - a.avgUtilization);
  }

  goBack(): void {
    this.location.back();
  }
}
