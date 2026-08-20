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
      <button class="bt-back-btn" routerLink="/analytics">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>
        </svg>
        Back to Analytics
      </button>

      <div class="bt-topbar" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 class="bt-title">Reports & Documentation</h1>
          <p class="bt-subtitle">Generate, manage, and export project reports in PDF or Excel/CSV format</p>
        </div>
        <button class="bt-add-btn" routerLink="/analytics/reports/generate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Generate New Report</span>
        </button>
      </div>

      <!-- Report Filters -->
      <div class="bt-panel" style="margin-bottom: 24px;">
        <div class="bt-form-grid" style="align-items: flex-end;">
          <label>
            <span>Report Type</span>
            <select [(ngModel)]="selectedReportType" (change)="applyFilters()">
              <option value="all">All Reports</option>
              <option value="progress">Progress Reports</option>
              <option value="resource">Resource Reports</option>
              <option value="budget">Budget Reports</option>
              <option value="workforce">Workforce Reports</option>
              <option value="procurement">Procurement Reports</option>
            </select>
          </label>
          <label>
            <span>Status</span>
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()">
              <option value="all">All Status</option>
              <option value="generated">Generated</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </label>
          <div style="grid-column: span 2;">
            <label style="display: block; margin-bottom: 6px;">
              <span>Date Range</span>
            </label>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="date" [(ngModel)]="startDate" (change)="applyFilters()" style="flex: 1;">
              <span style="color: var(--text-secondary); font-size: 13px; font-weight: 600;">to</span>
              <input type="date" [(ngModel)]="endDate" (change)="applyFilters()" style="flex: 1;">
            </div>
          </div>
          <div>
            <button class="bt-filter-btn" (click)="clearFilters()" style="width: 100%; justify-content: center; margin-top: 24px;">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Reports Grid -->
      <div class="bt-panel" *ngIf="!isLoading && filteredReports.length > 0">
        <div class="bt-panel-header">
          <div>
            <h3 class="bt-panel-title">Available Reports</h3>
            <span class="bt-panel-sub">Showing {{ filteredReports.length }} report(s)</span>
          </div>
        </div>
        <div class="bt-table-wrap">
          <table class="bt-table">
            <thead>
              <tr>
                <th>Report Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date Generated</th>
                <th>Format</th>
                <th style="text-align: right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let report of filteredReports">
                <td>
                  <div class="bt-strong">{{ report.title }}</div>
                  <div class="bt-muted" style="font-size: 12px; margin-top: 4px;">{{ report.description }}</div>
                </td>
                <td>
                  <span class="bt-badge" [ngClass]="report.type === 'progress' ? 'blue' : report.type === 'budget' ? 'green' : report.type === 'resource' ? 'purple' : report.type === 'workforce' ? 'orange' : 'gray'">
                    {{ report.type | uppercase }}
                  </span>
                </td>
                <td>
                  <span class="bt-badge gray">{{ report.status }}</span>
                </td>
                <td>{{ report.generatedDate | date:'mediumDate' }}</td>
                <td><span class="bt-badge gray">{{ report.format | uppercase }}</span></td>
                <td style="text-align: right">
                  <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="bt-filter-btn" (click)="exportPDF(report)" title="Export HTML/PDF">
                      PDF
                    </button>
                    <button class="bt-filter-btn" (click)="exportExcel(report)" title="Export CSV/Excel">
                      CSV
                    </button>
                    <button class="bt-filter-btn" (click)="deleteReport(report.id)" style="color: var(--bt-red);">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="bt-panel" style="padding: 48px; text-align: center; color: var(--text-secondary);">
        <p>Loading reports...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredReports.length === 0" class="bt-panel" style="padding: 48px; text-align: center;">
        <h3 class="bt-strong" style="margin-bottom: 8px; font-size: 18px;">No Reports Found</h3>
        <p class="bt-muted" style="margin-bottom: 24px;">Adjust your filters or generate a new report to get started.</p>
        <button class="bt-add-btn" routerLink="/analytics/reports/generate" style="margin: 0 auto;">
          <span>Generate Report</span>
        </button>
      </div>
    </div>
  `
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
    this.location.back();
  }
}