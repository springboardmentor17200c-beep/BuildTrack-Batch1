import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AnalyticsDashboardComponent } from './models/components/analytics/analytics-dashboard.component';
import { ReportsDashboardComponent } from './models/components/analytics/report-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, AnalyticsDashboardComponent, ReportsDashboardComponent],
  template: `
    <div class="app-container">
      <nav class="navbar">
        <div class="nav-brand">
          <span class="logo">🏗️</span>
          <span class="brand-name">BuildTrack</span>
        </div>
        <div class="nav-links">
          <button class="nav-link" [class.active]="activeView === 'analytics'" (click)="switchView('analytics')">
            <mat-icon>dashboard</mat-icon> Analytics
          </button>
          <button class="nav-link" [class.active]="activeView === 'reports'" (click)="switchView('reports')">
            <mat-icon>description</mat-icon> Reports
          </button>
        </div>
      </nav>
      
      <div class="main-content">
        <app-analytics-dashboard *ngIf="activeView === 'analytics'"></app-analytics-dashboard>
        <app-reports-dashboard *ngIf="activeView === 'reports'"></app-reports-dashboard>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f5f7fa;
    }
    .navbar {
      background: white;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .logo {
      font-size: 28px;
    }
    .brand-name {
      background: linear-gradient(135deg, #3f51b5, #2196f3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .nav-links {
      display: flex;
      gap: 8px;
    }
    .nav-link {
      padding: 8px 16px;
      border: none;
      background: transparent;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .nav-link:hover {
      background: #f5f5f5;
      color: #1a1a1a;
    }
    .nav-link.active {
      background: #e8eaf6;
      color: #3f51b5;
    }
    .nav-link .mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .main-content {
      padding: 0;
    }
    @media (max-width: 600px) {
      .nav-brand .brand-name {
        display: none;
      }
      .nav-link span {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  activeView: 'analytics' | 'reports' = 'analytics';

  switchView(view: 'analytics' | 'reports') {
    this.activeView = view;
  }
}