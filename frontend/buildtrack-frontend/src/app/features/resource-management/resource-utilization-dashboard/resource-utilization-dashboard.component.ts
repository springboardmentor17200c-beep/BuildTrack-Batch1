import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Resource, ResourceCategory, ResourceAllocation } from '../models/resource.model';
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
  styleUrls: ['./resource-utilization-dashboard.component.css']
})
export class ResourceUtilizationDashboardComponent implements OnInit {

  resources: Resource[] = [];
  categorySummaries: CategorySummary[] = [];

  totalAssets = 0;
  inUseCount = 0;
  availableCount = 0;
  maintenanceCount = 0;
  avgUtilization = 0;

  constructor(
    private data: ResourceDataService,
    private location: Location
  ) {}

  ngOnInit(): void {

    this.data.resources$.subscribe((resources: Resource[]) => {
      this.resources = resources;
      this.computeStats();
    });

    this.data.allocations$.subscribe((_: ResourceAllocation[]) => {
      this.computeStats();
    });

  }

  private computeStats(): void {

    this.totalAssets = this.resources.length;

    this.inUseCount = this.resources.filter(
      (r: Resource) => r.currentStatus === 'Allocated'
    ).length;

    this.availableCount = this.resources.filter(
      (r: Resource) => r.currentStatus === 'Available'
    ).length;

    this.maintenanceCount = this.resources.filter(
      (r: Resource) => r.currentStatus === 'Under Maintenance'
    ).length;

    const utilizations = this.resources.map(
      (r: Resource) => this.data.getUtilization(r.resourceId)
    );

    this.avgUtilization = utilizations.length
      ? Math.round(
          utilizations.reduce((sum, value) => sum + value, 0) /
          utilizations.length
        )
      : 0;

    const categories = [...new Set(this.resources.map(r => r.category))];

    this.categorySummaries = categories.map(category => {

      const items = this.resources.filter(r => r.category === category);

      const values = items.map(r =>
        this.data.getUtilization(r.resourceId)
      );

      const avg = values.length
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0;

      return {
        category,
        avgUtilization: avg,
        total: items.length,
        inUse: items.filter(r => r.currentStatus === 'Allocated').length
      };

    }).sort((a, b) => b.avgUtilization - a.avgUtilization);

  }

  goBack(): void {
    this.location.back();
  }

}