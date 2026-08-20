import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectProgressSummary } from '../models/analytics.model';
import { AnalyticsDataService } from '../analytics-data.service';
import { Chart } from 'chart.js/auto';

interface CategorySummary {
  category: string;
  avgProgress: number;
  count: number;
}

@Component({
  selector: 'app-progress-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './progress-analytics.component.html',
  styleUrls: ['./progress-analytics.component.css'],
})
export class ProgressAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('completionChart') completionChartRef!: ElementRef;

  statusChart: any;
  completionChart: any;

  projects: ProjectProgressSummary[] = [];
  categorySummaries: CategorySummary[] = [];

  totalProjects = 0;
  inProgressCount = 0;
  onHoldCount = 0;
  completedCount = 0;
  avgProgress = 0;

  constructor(private data: AnalyticsDataService, private location: Location) {}

  ngOnInit(): void {
    this.data.progress$.subscribe(rows => {
      this.projects = rows;
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
        data: { labels: ['In Progress', 'On Hold', 'Completed'], datasets: [{ data: [0,0,0], backgroundColor: ['#3b82f6', '#f97316', '#10b981'] }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    const ctxComp = this.completionChartRef?.nativeElement;
    if (ctxComp) {
      this.completionChart = new Chart(ctxComp, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Completion %', data: [], backgroundColor: '#8b5cf6' }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
      });
    }
    
    this.updateCharts();
  }

  private updateCharts() {
    if (this.statusChart) {
      this.statusChart.data.datasets[0].data = [this.inProgressCount, this.onHoldCount, this.completedCount];
      this.statusChart.update();
    }

    if (this.completionChart && this.projects.length > 0) {
      this.completionChart.data.labels = this.projects.map(p => p.project);
      this.completionChart.data.datasets[0].data = this.projects.map(p => p.completionPercentage);
      this.completionChart.update();
    }
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
