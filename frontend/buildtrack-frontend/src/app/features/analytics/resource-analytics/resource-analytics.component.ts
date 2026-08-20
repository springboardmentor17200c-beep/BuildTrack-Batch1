import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Resource, ResourceCategory } from '../../resource-management/models/resource.model';
import { ResourceDataService } from '../../resource-management/resource-data.service';
import { Chart } from 'chart.js/auto';

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
export class ResourceAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('utilizationChart') utilizationChartRef!: ElementRef;

  statusChart: any;
  utilizationChart: any;

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
      this.updateCharts();
    });
    this.resourceData.allocations$.subscribe(() => {
      this.computeStats();
      this.updateCharts();
    });
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  private initCharts() {
    const ctxStatus = this.statusChartRef?.nativeElement;
    if (ctxStatus) {
      this.statusChart = new Chart(ctxStatus, {
        type: 'pie',
        data: { labels: ['Available', 'Allocated', 'Under Maintenance'], datasets: [{ data: [0,0,0], backgroundColor: ['#10b981', '#3b82f6', '#f97316'] }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    const ctxUtil = this.utilizationChartRef?.nativeElement;
    if (ctxUtil) {
      this.utilizationChart = new Chart(ctxUtil, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Avg Utilization %', data: [], backgroundColor: '#8b5cf6' }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
      });
    }
    
    this.updateCharts();
  }

  private updateCharts() {
    if (this.statusChart) {
      this.statusChart.data.datasets[0].data = [this.availableCount, this.inUseCount, this.maintenanceCount];
      this.statusChart.update();
    }

    if (this.utilizationChart && this.categorySummaries.length > 0) {
      this.utilizationChart.data.labels = this.categorySummaries.map(c => c.category);
      this.utilizationChart.data.datasets[0].data = this.categorySummaries.map(c => c.avgUtilization);
      this.utilizationChart.update();
    }
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
