import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService } from '../../../services/report.service';
import { Report, ReportFilter } from '../../../models/report.model';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="reports-dashboard">
      <div class="dashboard-header">
        <div class="header-left">
          <h1>Reports & Documentation</h1>
          <p class="subtitle">Generate, manage, and export project reports</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="generateNewReport()">
            <mat-icon>add</mat-icon> Generate Report
          </button>
        </div>
      </div>

      <!-- Report Filters -->
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item">
            <label>Report Type</label>
            <select [(ngModel)]="selectedReportType" (change)="applyFilters()">
              <option value="all">All Reports</option>
              <option value="progress">Progress Reports</option>
              <option value="resource">Resource Reports</option>
              <option value="budget">Budget Reports</option>
              <option value="workforce">Workforce Reports</option>
              <option value="procurement">Procurement Reports</option>
            </select>
          </div>
          <div class="filter-item">
            <label>Status</label>
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()">
              <option value="all">All Status</option>
              <option value="generated">Generated</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div class="filter-item">
            <label>Date Range</label>
            <div class="date-range">
              <input type="date" [(ngModel)]="startDate" (change)="applyFilters()">
              <span>to</span>
              <input type="date" [(ngModel)]="endDate" (change)="applyFilters()">
            </div>
          </div>
          <div class="filter-item">
            <button class="btn btn-outline" (click)="clearFilters()">
              <mat-icon>clear</mat-icon> Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Reports Grid -->
      <div class="reports-grid" *ngIf="!isLoading">
        <div class="report-card" *ngFor="let report of filteredReports">
          <div class="report-header">
            <div class="report-type-badge" [class]="report.type">
              {{ report.type }}
            </div>
            <div class="report-status-badge" [class]="report.status">
              {{ report.status }}
            </div>
          </div>
          <div class="report-body">
            <h3>{{ report.title }}</h3>
            <p class="report-description">{{ report.description }}</p>
            <div class="report-meta">
              <span class="meta-item">
                <mat-icon>event</mat-icon>
                {{ report.generatedDate | date:'mediumDate' }}
              </span>
              <span class="meta-item">
                <mat-icon>description</mat-icon>
                {{ report.format }}
              </span>
            </div>
          </div>
          <div class="report-actions">
            <button class="btn btn-sm btn-outline" (click)="viewReport(report)">
              <mat-icon>visibility</mat-icon> View
            </button>
            <button class="btn btn-sm btn-outline" (click)="exportPDF(report)">
              <mat-icon>picture_as_pdf</mat-icon> PDF
            </button>
            <button class="btn btn-sm btn-outline" (click)="exportExcel(report)">
              <mat-icon>table_chart</mat-icon> Excel
            </button>
            <button class="btn btn-sm btn-danger" (click)="deleteReport(report.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading reports...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredReports.length === 0" class="empty-state">
        <mat-icon>description</mat-icon>
        <h3>No Reports Found</h3>
        <p>Generate a new report to get started</p>
        <button class="btn btn-primary" (click)="generateNewReport()">
          Generate Report
        </button>
      </div>
    </div>
  `,
  styles: [`
    .reports-dashboard {
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
    .btn-danger {
      background: transparent;
      color: #f44336;
      border: 1px solid #f44336;
    }
    .btn-danger:hover {
      background: #ffebee;
    }
    .btn-sm {
      padding: 4px 12px;
      font-size: 12px;
    }
    .mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .filter-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: flex-end;
    }
    .filter-item {
      flex: 1;
      min-width: 150px;
    }
    .filter-item label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #555;
      margin-bottom: 4px;
    }
    .filter-item select,
    .filter-item input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .date-range {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .date-range input {
      flex: 1;
    }
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }
    .report-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .report-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .report-header {
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .report-type-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .report-type-badge.progress { background: #e3f2fd; color: #1976d2; }
    .report-type-badge.resource { background: #e8f5e9; color: #388e3c; }
    .report-type-badge.budget { background: #fff3e0; color: #f57c00; }
    .report-type-badge.workforce { background: #f3e5f5; color: #7b1fa2; }
    .report-type-badge.procurement { background: #fce4ec; color: #c62828; }
    .report-status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .report-status-badge.generated { background: #e8f5e9; color: #388e3c; }
    .report-status-badge.draft { background: #fff3e0; color: #f57c00; }
    .report-status-badge.scheduled { background: #e3f2fd; color: #1976d2; }
    .report-status-badge.archived { background: #f5f5f5; color: #757575; }
    .report-body {
      padding: 20px;
    }
    .report-body h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #1a1a1a;
    }
    .report-description {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #666;
    }
    .report-meta {
      display: flex;
      gap: 16px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #999;
    }
    .meta-item .mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .report-actions {
      padding: 12px 20px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
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
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
    }
    .empty-state .mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }
    .empty-state h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }
    .empty-state p {
      color: #666;
      margin-bottom: 20px;
    }
    @media (max-width: 768px) {
      .reports-grid {
        grid-template-columns: 1fr;
      }
      .filter-row {
        flex-direction: column;
      }
      .filter-item {
        min-width: 100%;
      }
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      .header-actions {
        width: 100%;
      }
      .header-actions .btn {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class ReportsDashboardComponent implements OnInit {
  reports: Report[] = [];
  filteredReports: Report[] = [];
  isLoading = false;

  selectedReportType = 'all';
  selectedStatus = 'all';
  startDate = '';
  endDate = '';

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.reportService.getReports().subscribe({
      next: (reports: Report[]) => {
        this.reports = reports;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading reports:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.filteredReports = this.reports.filter(report => {
      let matches = true;

      // Filter by type
      if (this.selectedReportType !== 'all' && report.type !== this.selectedReportType) {
        matches = false;
      }

      // Filter by status
      if (this.selectedStatus !== 'all' && report.status !== this.selectedStatus) {
        matches = false;
      }

      // Filter by date
      if (this.startDate && this.endDate) {
        const reportDate = new Date(report.generatedDate);
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        if (reportDate < start || reportDate > end) {
          matches = false;
        }
      }

      return matches;
    });
  }

  clearFilters() {
    this.selectedReportType = 'all';
    this.selectedStatus = 'all';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  generateNewReport() {
    // Open report generation dialog
    console.log('Generate new report');
    // You can implement a dialog here
  }

  viewReport(report: Report) {
    console.log('View report:', report);
    // Implement report view
  }

  exportPDF(report: Report) {
    this.reportService.exportReportToPDF(report.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Error exporting PDF:', err);
        alert('Failed to export PDF. Please try again.');
      }
    });
  }

  exportExcel(report: Report) {
    this.reportService.exportReportToExcel(report.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Error exporting Excel:', err);
        alert('Failed to export Excel. Please try again.');
      }
    });
  }

  deleteReport(id: string) {
    if (confirm('Are you sure you want to delete this report?')) {
      this.reportService.deleteReport(id).subscribe({
        next: () => {
          this.loadReports();
        },
        error: (err: any) => {
          console.error('Error deleting report:', err);
          alert('Failed to delete report. Please try again.');
        }
      });
    }
  }
}