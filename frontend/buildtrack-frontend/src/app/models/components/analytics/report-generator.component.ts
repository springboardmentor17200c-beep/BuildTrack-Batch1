import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ReportService } from '../../../services/report.service';
import { Report, ReportFilter, ReportType } from '../../../models/report.model';

@Component({
  selector: 'app-report-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bt-page">
      <button class="bt-back-btn" routerLink="/analytics">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>
        </svg>
        Back to Reports
      </button>

      <div class="bt-topbar">
        <div>
          <h1 class="bt-title">Generate New Report</h1>
          <p class="bt-subtitle">Select report type, apply scope filters, and export instant analytics.</p>
        </div>
        <div class="bt-actions">
          <button class="bt-filter-btn" (click)="close()">
            ✕ Close
          </button>
        </div>
      </div>

      <div class="bt-form-card" *ngIf="!isGenerating && !generatedReport">
        <div class="bt-form-grid">
          <label style="grid-column: 1 / -1;">
            <span>Report Type *</span>
            <select [(ngModel)]="reportType" (change)="onTypeChange()">
              <option value="progress">📊 Progress Report</option>
              <option value="resource">🔧 Resource Report</option>
              <option value="budget">💰 Budget Report</option>
              <option value="workforce">👷 Workforce Report</option>
              <option value="procurement">📦 Procurement Report</option>
            </select>
          </label>

          <label style="grid-column: 1 / -1;">
            <span>Report Title</span>
            <input type="text" [(ngModel)]="reportTitle" placeholder="Enter report title">
          </label>

          <div style="grid-column: 1 / -1;">
            <label style="display: block; margin-bottom: 6px;">
              <span>Date Range</span>
            </label>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="date" [(ngModel)]="filter.startDate" style="flex: 1;">
              <span style="color: var(--text-secondary); font-size: 13px; font-weight: 600;">to</span>
              <input type="date" [(ngModel)]="filter.endDate" style="flex: 1;">
            </div>
          </div>

          <label style="grid-column: 1 / -1;" *ngIf="reportType === 'resource'">
            <span>Resource Category</span>
            <select [(ngModel)]="filter.category">
              <option value="all">All Categories</option>
              <option value="equipment">Equipment</option>
              <option value="tools">Tools</option>
              <option value="vehicles">Vehicles</option>
            </select>
          </label>

          <label style="grid-column: 1 / -1;" *ngIf="reportType === 'workforce'">
            <span>Department</span>
            <select [(ngModel)]="filter.department">
              <option value="all">All Departments</option>
              <option value="construction">Construction</option>
              <option value="finishing">Finishing</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
            </select>
          </label>

          <label style="grid-column: 1 / -1;" *ngIf="reportType === 'procurement'">
            <span>Supplier</span>
            <select [(ngModel)]="filter.supplier">
              <option value="all">All Suppliers</option>
              <option value="abc-steel">ABC Steel</option>
              <option value="xyz-cement">XYZ Cement</option>
              <option value="pqr-tools">PQR Tools</option>
            </select>
          </label>

          <div style="grid-column: 1 / -1;">
            <label style="display: block; margin-bottom: 6px;">
              <span>Auto Export Formats</span>
            </label>
            <div style="display: flex; gap: 16px;">
              <label style="flex-direction: row; align-items: center; gap: 8px;">
                <input type="checkbox" [(ngModel)]="exportPDF" style="width: auto;"> 
                <span style="font-weight: 500;">Export PDF/HTML</span>
              </label>
              <label style="flex-direction: row; align-items: center; gap: 8px;">
                <input type="checkbox" [(ngModel)]="exportExcel" style="width: auto;"> 
                <span style="font-weight: 500;">Export CSV/Excel</span>
              </label>
            </div>
          </div>
        </div>

        <div class="bt-form-actions" style="margin-top: 32px; gap: 12px; justify-content: flex-end;">
          <button class="bt-filter-btn" (click)="close()">Cancel</button>
          <button class="bt-add-btn" (click)="generate()">
            Generate Report
          </button>
        </div>
      </div>

      <!-- Generating Progress -->
      <div *ngIf="isGenerating" class="bt-panel" style="padding: 60px; text-align: center;">
        <div style="width: 40px; height: 40px; border: 3px solid var(--bt-panel-border); border-top-color: var(--bt-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <h3 class="bt-title">Generating {{ reportTitle }}...</h3>
        <p class="bt-subtitle" style="margin-top: 8px;">Gathering analytics data and formatting report outputs.</p>
      </div>

      <!-- Generation Success / Live Preview -->
      <div *ngIf="generatedReport && !isGenerating" class="bt-panel" style="display: flex; flex-direction: column; height: 800px; padding: 0;">
        <div style="padding: 20px 24px; border-bottom: 1px solid var(--bt-panel-border); display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <h3 class="bt-title" style="margin: 0; color: #0f172a; font-size: 18px;">✅ {{ generatedReport.title }}</h3>
            <p class="bt-subtitle" style="margin: 4px 0 0 0;">Live Report Preview</p>
          </div>
          <div style="display: flex; gap: 12px;">
            <button class="bt-filter-btn" (click)="exportGeneratedPDF()">
              📥 Download HTML/PDF
            </button>
            <button class="bt-filter-btn" (click)="exportGeneratedExcel()">
              📊 Download CSV
            </button>
          </div>
        </div>
        <div style="flex: 1; background: #e2e8f0; padding: 24px; overflow-y: auto;">
          <iframe 
            [srcdoc]="reportHtml" 
            style="width: 100%; height: 100%; min-height: 800px; border: none; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);"
            title="Report Preview">
          </iframe>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ReportGeneratorComponent implements OnInit {
  reportType: ReportType = 'progress';
  reportTitle = '';
  isGenerating = false;
  generatedReport: Report | null = null;
  exportPDF = true;
  exportExcel = false;
  reportHtml: SafeHtml | string = '';

  filter: any = {
    startDate: '',
    endDate: '',
    category: 'all',
    department: 'all',
    supplier: 'all'
  };

  constructor(
    private reportService: ReportService,
    private router: Router,
    private location: Location,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.setDefaultTitle();
  }

  onTypeChange() {
    this.setDefaultTitle();
  }

  setDefaultTitle() {
    const typeNames: Record<ReportType, string> = {
      progress: 'Progress Report',
      resource: 'Resource Report',
      budget: 'Budget Report',
      workforce: 'Workforce Report',
      procurement: 'Procurement Report',
      custom: 'Custom Report'
    };
    this.reportTitle = `${typeNames[this.reportType]} - ${new Date().toLocaleDateString()}`;
  }

  generate() {
    if (!this.reportType) {
      alert('Please select a report type');
      return;
    }

    this.isGenerating = true;
    this.generatedReport = null;

    const reportFilter: ReportFilter = {
      dateRange: {
        start: this.filter.startDate ? new Date(this.filter.startDate) : new Date(),
        end: this.filter.endDate ? new Date(this.filter.endDate) : new Date()
      }
    };

    this.reportService.generateReport(this.reportType, reportFilter).subscribe({
      next: (report: Report) => {
        this.generatedReport = report;
        this.isGenerating = false;
        
        // Generate the HTML for the iframe
        this.reportService.exportReportToPDF(report.id).subscribe((blob: Blob) => {
          blob.text().then(text => {
            this.reportHtml = this.sanitizer.bypassSecurityTrustHtml(text);
          });
        });

        if (this.exportPDF) {
          this.exportGeneratedPDF();
        }
        if (this.exportExcel) {
          this.exportGeneratedExcel();
        }
      },
      error: (err: any) => {
        console.error('Error generating report:', err);
        alert('Failed to generate report.');
        this.isGenerating = false;
      }
    });
  }

  exportGeneratedPDF() {
    if (this.generatedReport) {
      this.reportService.exportReportToPDF(this.generatedReport.id).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.generatedReport!.title}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err: any) => console.error('Error exporting PDF:', err)
      });
    }
  }

  exportGeneratedExcel() {
    if (this.generatedReport) {
      this.reportService.exportReportToExcel(this.generatedReport.id).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.generatedReport!.title}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err: any) => console.error('Error exporting Excel:', err)
      });
    }
  }

  close() {
    this.router.navigate(['/analytics/reports']);
  }
}