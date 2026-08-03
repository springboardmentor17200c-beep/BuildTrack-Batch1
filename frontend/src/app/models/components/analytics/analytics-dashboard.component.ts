import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // IMPORTANT
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AnalyticsService } from '../../../services/analytics.service';
import { DashboardData } from '../../../models/analytics.model';
import { BudgetAnalyticsComponent } from './budget-analytics.component';
import { ProgressAnalyticsComponent } from './progress-analytics.component';
import { ResourceAnalyticsComponent } from './resource-analytics.component';
import { ProcurementAnalyticsComponent } from './procurement-analytics.component';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,  // Make it standalone
  imports: [
    CommonModule,  // For *ngIf, *ngFor
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    BudgetAnalyticsComponent,
    ProgressAnalyticsComponent,
    ResourceAnalyticsComponent,
    ProcurementAnalyticsComponent
  ],
  template: `
    <div class="analytics-dashboard">
      <!-- Dashboard Header -->
      <div class="dashboard-header">
        <div class="header-left">
          <h1>Analytics Dashboard</h1>
          <p class="subtitle">Real-time insights and analytics for your construction project</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="exportReport('pdf')">
            <mat-icon>picture_as_pdf</mat-icon> Export PDF
          </button>
          <button class="btn btn-outline" (click)="exportReport('excel')">
            <mat-icon>table_chart</mat-icon> Export Excel
          </button>
          <button class="btn btn-primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon> Refresh
          </button>
        </div>
      </div>
      
      <!-- Loading/Error States -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
      
      <div *ngIf="error" class="error-state">
        <mat-icon>error_outline</mat-icon>
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="loadData()">Retry</button>
      </div>
      
      <!-- Tab Navigation -->
      <mat-tab-group *ngIf="!isLoading && !error" (selectedIndexChange)="onTabChange($event)">
        <mat-tab label="Budget Overview">
          <app-budget-analytics [data]="dashboardData?.budget"></app-budget-analytics>
        </mat-tab>
        <mat-tab label="Project Progress">
          <app-progress-analytics [data]="dashboardData?.progress"></app-progress-analytics>
        </mat-tab>
        <mat-tab label="Resource Management">
          <app-resource-analytics [data]="dashboardData?.resources"></app-resource-analytics>
        </mat-tab>
        <mat-tab label="Procurement">
          <app-procurement-analytics [data]="dashboardData?.procurement"></app-procurement-analytics>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .analytics-dashboard {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }
    .dashboard-header {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .header-left h1 {
      margin: 0 0 4px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .subtitle {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .header-actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #3f51b5;
      color: white;
    }
    .btn-primary:hover {
      background: #303f9f;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
    }
    .btn-outline {
      background: transparent;
      color: #555;
      border: 1px solid #ddd;
    }
    .btn-outline:hover {
      background: #f5f5f5;
      border-color: #bbb;
    }
    .mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 20px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3f51b5;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
    }
    .error-state .mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
    }
    ::ng-deep .mat-tab-group {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    ::ng-deep .mat-tab-header {
      border-bottom: 1px solid #e0e0e0;
      padding: 0 20px;
    }
    ::ng-deep .mat-tab-label {
      font-weight: 500;
      color: #555;
      opacity: 1 !important;
      padding: 0 20px;
      height: 56px;
    }
    ::ng-deep .mat-tab-label.mat-tab-label-active {
      color: #3f51b5;
    }
    ::ng-deep .mat-ink-bar {
      background-color: #3f51b5 !important;
    }
    ::ng-deep .mat-tab-body-content {
      padding: 0;
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  isLoading = false;
  error: string | null = null;
  activeTabIndex = 0;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.error = null;
    
    this.analyticsService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  refreshData() {
    this.loadData();
  }

  onTabChange(index: number) {
    this.activeTabIndex = index;
  }

  exportReport(type: 'pdf' | 'excel') {
    const tabs = ['budget', 'progress', 'resources', 'procurement'];
    const tabName = tabs[this.activeTabIndex] || 'dashboard';
    
    this.analyticsService.exportReport(tabName, type).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${tabName}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error exporting report:', err);
        alert('Failed to export report. Please try again.');
      }
    });
  }
}