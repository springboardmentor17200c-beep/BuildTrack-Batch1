import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectProgressSummary } from '../models/analytics.model';
import { AnalyticsDataService } from '../analytics-data.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

interface CategorySummary {
  category: string;
  avgProgress: number;
  count: number;
}

@Component({
  selector: 'app-progress-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './progress-analytics.component.html',
  styleUrls: ['./progress-analytics.component.css'],
})
export class ProgressAnalyticsComponent implements OnInit {
  projects: ProjectProgressSummary[] = [];
  categorySummaries: CategorySummary[] = [];

  totalProjects = 0;
  inProgressCount = 0;
  onHoldCount = 0;
  completedCount = 0;
  avgProgress = 0;

  // Chart configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'right' },
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [ { data: [] } ]
  };
  public pieChartType: ChartType = 'pie';

  constructor(private data: AnalyticsDataService, private location: Location) {}

  ngOnInit(): void {
    this.data.progress$.subscribe(rows => {
      this.projects = rows;
      this.computeStats();
    });
  }

  private computeStats() {
    this.totalProjects = this.projects.length;
    this.inProgressCount = this.projects.filter(p => p.status === 'In Progress').length;
    this.onHoldCount = this.projects.filter(p => p.status === 'On Hold').length;
    this.completedCount = this.projects.filter(p => p.status === 'Completed').length;
    this.avgProgress = this.totalProjects
      ? Math.round(this.projects.reduce((s, p) => s + p.completionPercentage, 0) / this.totalProjects)
      : 0;

    const categories = Array.from(new Set(this.projects.map(p => p.category)));
    this.categorySummaries = categories.map(category => {
      const items = this.projects.filter(p => p.category === category);
      return {
        category,
        avgProgress: Math.round(items.reduce((s, p) => s + p.completionPercentage, 0) / items.length),
        count: items.length,
      };
    });

    // Update chart
    this.pieChartData = {
      labels: ['In Progress', 'On Hold', 'Completed'],
      datasets: [{
        data: [this.inProgressCount, this.onHoldCount, this.completedCount],
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981']
      }]
    };
  }

  statusClass(status: ProjectProgressSummary['status']) {
    return { Planning: 'gray', 'In Progress': 'blue', 'On Hold': 'orange', Completed: 'green' }[status];
  }

  progressColor(pct: number) {
    return pct >= 90 ? 'green' : pct >= 50 ? 'blue' : 'orange';
  }

  goBack(): void {
    this.location.back();
  }
}
