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
          <h1 class="bt-title">Reports Dashboard</h1>
          <p class="bt-subtitle">View and export your generated project reports</p>
        </div>
        <div style="display: flex; gap: 16px; align-items: center;">
          <input type="text" [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="🔍 Search reports..." style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--bt-panel-border); min-width: 250px; background: var(--bt-panel-bg); color: var(--text-primary); outline: none;">
          <button class="bt-add-btn" routerLink="/analytics/reports/generate" style="background: #3b82f6; color: white;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Generate New</span>
          </button>
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
                <th>Report Name</th>
                <th>Category</th>
                <th>Date Generated</th>
                <th style="text-align: right">Downloads</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let report of filteredReports">
                <td>
                  <div class="bt-strong" style="font-size: 15px;">{{ report.title }}</div>
                </td>
                <td>
                  <span class="bt-badge" [ngClass]="report.type === 'progress' ? 'blue' : report.type === 'budget' ? 'green' : report.type === 'procurement' ? 'orange' : 'gray'">
                    {{ report.type | uppercase }}
                  </span>
                </td>
                <td style="color: var(--text-secondary);">{{ report.generatedDate | date:'mediumDate' }}</td>
                <td style="text-align: right">
                  <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="bt-filter-btn" (click)="exportPDF(report)" title="Download HTML/PDF">
                      📥 HTML
                    </button>
                    <button class="bt-filter-btn" (click)="exportExcel(report)" title="Download CSV Data">
                      📊 CSV
                    </button>
                    <button class="bt-filter-btn" (click)="deleteReport(report.id)" style="color: #ef4444; background: #fef2f2; border-color: #fecaca;" title="Delete Report">
                      Trash
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
      <div *ngIf="!isLoading && filteredReports.length === 0" class="bt-panel" style="padding: 80px 48px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">📁</div>
        <h3 class="bt-strong" style="margin-bottom: 8px; font-size: 20px;">No Reports Found</h3>
        <p class="bt-muted" style="margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto;">You haven't generated any reports yet, or none match your search.</p>
        <button class="bt-add-btn" routerLink="/analytics/reports/generate" style="margin: 0 auto; background: #3b82f6; color: white;">
          <span>Generate Your First Report</span>
        </button>
      </div>
    </div>
  `
})
export class ReportsDashboardComponent implements OnInit {
  reports: Report[] = [];
  filteredReports: Report[] = [];
  isLoading = false;

  searchTerm = '';

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
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredReports = [...this.reports];
      return;
    }
    
    this.filteredReports = this.reports.filter(report => 
      report.title.toLowerCase().includes(term) || 
      report.type.toLowerCase().includes(term)
    );
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