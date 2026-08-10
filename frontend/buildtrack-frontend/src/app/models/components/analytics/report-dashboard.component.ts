import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ReportService } from '../../../services/report.service';
import { Report } from '../../../models/report.model';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bt-page">
      <button class="bt-back-btn" (click)="goBack()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>
        </svg>
        Back to Analytics
      </button>

      <div class="dashboard-header">
        <div class="header-left">
          <h1>Reports & Documentation</h1>
          <p class="subtitle">Generate, manage, and export project reports in PDF or Excel/CSV format</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="generateNewReport()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Generate New Report
          </button>
        </div>
      </div>

      <!-- Report Filters -->
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item">
            <label>Report Type</label>
            <select [(ngModel)]="selectedReportType" (change)="applyFilters()" class="form-control">
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
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="form-control">
              <option value="all">All Status</option>
              <option value="generated">Generated</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div class="filter-item">
            <label>Date Range</label>
            <div class="date-range">
              <input type="date" [(ngModel)]="startDate" (change)="applyFilters()" class="form-control">
              <span>to</span>
              <input type="date" [(ngModel)]="endDate" (change)="applyFilters()" class="form-control">
            </div>
          </div>
          <div class="filter-item filter-actions-item">
            <button class="btn btn-outline" (click)="clearFilters()">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Reports Grid -->
      <div class="reports-grid" *ngIf="!isLoading && filteredReports.length > 0">
        <div class="report-card" *ngFor="let report of filteredReports">
          <div class="report-header">
            <span class="type-badge" [ngClass]="report.type">{{ report.type | uppercase }}</span>
            <span class="status-badge" [ngClass]="report.status">{{ report.status }}</span>
          </div>
          <div class="report-body">
            <h3>{{ report.title }}</h3>
            <p class="report-description">{{ report.description }}</p>
            <div class="report-meta">
              <span class="meta-item">
                📅 {{ report.generatedDate | date:'mediumDate' }}
              </span>
              <span class="meta-item">
                📄 {{ report.format | uppercase }}
              </span>
            </div>
          </div>
          <div class="report-actions">
            <button class="btn btn-sm btn-outline" (click)="exportPDF(report)" title="Export HTML/PDF">
              📥 Export PDF
            </button>
            <button class="btn btn-sm btn-outline" (click)="exportExcel(report)" title="Export CSV/Excel">
              📊 Export CSV
            </button>
            <button class="btn btn-sm btn-danger" (click)="deleteReport(report.id)">
              🗑️ Delete
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
        <h3>No Reports Found</h3>
        <p>Generate a new report to get started</p>
        <button class="btn btn-primary" (click)="generateNewReport()">
          Generate Report
        </button>
      </div>
    </div>
  `,
  styles: [`
    .bt-page {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .bt-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 16px;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .bt-back-btn:hover {
      color: #1e293b;
      background: #f1f5f9;
    }
    .dashboard-header {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }
    .header-left h1 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
    .subtitle {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }
    .header-actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
    .btn-outline {
      background: white;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-outline:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
    .btn-danger {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    .btn-danger:hover {
      background: #fee2e2;
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }
    .filter-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }
    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-end;
    }
    .filter-item {
      flex: 1;
      min-width: 160px;
    }
    .filter-actions-item {
      flex: 0 0 auto;
    }
    .filter-item label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 6px;
    }
    .form-control {
      width: 100%;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      font-size: 14px;
      color: #1e293b;
      background-color: white;
      box-sizing: border-box;
    }
    .date-range {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }
    .report-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .report-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .type-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;

      &.progress { background: #dbeafe; color: #1e40af; }
      &.budget { background: #dcfce7; color: #166534; }
      &.resource { background: #f3e8ff; color: #6b21a8; }
      &.workforce { background: #ffedd5; color: #9a3412; }
      &.procurement { background: #e0e7ff; color: #3730a3; }
    }
    .status-badge {
      font-size: 12px;
      font-weight: 500;
      padding: 3px 8px;
      border-radius: 4px;
      background: #f1f5f9;
      color: #475569;
    }
    .report-body h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }
    .report-description {
      margin: 0 0 16px 0;
      font-size: 13px;
      color: #64748b;
      line-height: 1.4;
    }
    .report-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 16px;
    }
    .report-actions {
      display: flex;
      gap: 8px;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }
    .empty-state {
      text-align: center;
      padding: 48px;
      background: white;
      border-radius: 12px;
      border: 1px dashed #cbd5e1;
    }
    .loading-state {
      text-align: center;
      padding: 48px;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 12px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
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

  constructor(
    private reportService: ReportService,
    private router: Router,
    private location: Location
  ) {}

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

      if (this.selectedReportType !== 'all' && report.type !== this.selectedReportType) {
        matches = false;
      }

      if (this.selectedStatus !== 'all' && report.status !== this.selectedStatus) {
        matches = false;
      }

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
    this.router.navigate(['/analytics/reports/generate']);
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
        alert('Failed to export PDF.');
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
        alert('Failed to export Excel.');
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
          alert('Failed to delete report.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/analytics']);
  }
}