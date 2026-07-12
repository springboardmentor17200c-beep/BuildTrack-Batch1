import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Resource, ResourceCategory } from '../../resource-management/models/resource.model';
import { ResourceDataService } from '../../resource-management/resource-data.service';

// NOTE: this page deliberately reuses ResourceDataService rather than
// duplicating resource data — Resource Analytics is just a different lens
// on the same `resources` / `resource_allocations` tables that the
// Resource Management module already owns.

interface CategorySummary {
  category: ResourceCategory;
  avgUtilization: number;
  total: number;
  inUse: number;
}

@Component({
  selector: 'app-resource-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resource-analytics.component.html',
  styleUrls: ['./resource-analytics.component.css'],
})
export class ResourceAnalyticsComponent implements OnInit {
  resources: Resource[] = [];
  categorySummaries: CategorySummary[] = [];

  totalAssets = 0;
  inUseCount = 0;
  availableCount = 0;
  maintenanceCount = 0;
  avgUtilization = 0;

  constructor(private resourceData: ResourceDataService, private location: Location) {}

  ngOnInit(): void {
    this.resourceData.resources$.subscribe(r => {
      this.resources = r;
      this.computeStats();
    });
    this.resourceData.allocations$.subscribe(() => this.computeStats());
  }

  private computeStats() {
    this.totalAssets = this.resources.length;
    this.inUseCount = this.resources.filter(r => r.currentStatus === 'Allocated').length;
    this.availableCount = this.resources.filter(r => r.currentStatus === 'Available').length;
    this.maintenanceCount = this.resources.filter(r => r.currentStatus === 'Under Maintenance').length;

    const utilizations = this.resources.map(r => this.resourceData.getUtilization(r.resourceId));
    this.avgUtilization = utilizations.length
      ? Math.round(utilizations.reduce((s, v) => s + v, 0) / utilizations.length)
      : 0;

    const categories = Array.from(new Set(this.resources.map(r => r.category)));
    this.categorySummaries = categories
      .map(category => {
        const items = this.resources.filter(r => r.category === category);
        const itemUtilizations = items.map(r => this.resourceData.getUtilization(r.resourceId));
        return {
          category,
          avgUtilization: itemUtilizations.length
            ? Math.round(itemUtilizations.reduce((s, v) => s + v, 0) / itemUtilizations.length)
            : 0,
          total: items.length,
          inUse: items.filter(r => r.currentStatus === 'Allocated').length,
        };
      })
      .sort((a, b) => b.avgUtilization - a.avgUtilization);
  }

  statusClass(status: Resource['currentStatus']) {
    return { Available: 'green', Allocated: 'blue', 'Under Maintenance': 'orange' }[status];
  }

  goBack(): void {
    this.location.back();
  }
}
