import { Component, OnInit } from '@angular/core';
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
      <button class="bt-back-btn" (click)="close()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>
        </svg>
        Back to Reports
      </button>

      <div class="generator-card">
        <div class="generator-header">
          <div>
            <h2>Generate New Report</h2>
            <p class="subtitle">Select report type, apply scope filters, and export instant analytics.</p>
          </div>
          <button class="btn btn-outline" (click)="close()">
            ✕ Close
          </button>
        </div>

        <div class="generator-form" *ngIf="!isGenerating && !generatedReport">
          <div class="form-group">
            <label>Report Type *</label>
            <select [(ngModel)]="reportType" (change)="onTypeChange()" class="form-control">
              <option value="project_comprehensive">🏢 Comprehensive Project Report</option>
              <option value="progress">📊 Progress Report</option>
              <option value="resource">🔧 Resource Report</option>
              <option value="budget">💰 Budget Report</option>
              <option value="workforce">👷 Workforce Report</option>
              <option value="procurement">📦 Procurement Report</option>
            </select>
          </div>

          <div class="form-group" *ngIf="reportType === 'project_comprehensive'">
            <label>Select Project *</label>
            <select [(ngModel)]="filter.projectId" class="form-control">
              <option value="" disabled selected>Select a project</option>
              <option *ngFor="let p of projects" [value]="p.project_id">{{ p.project_name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Report Title</label>
            <input type="text" [(ngModel)]="reportTitle" placeholder="Enter report title" class="form-control">
          </div>

          <div class="form-group">
            <label>Date Range</label>
            <div class="date-range">
              <input type="date" [(ngModel)]="filter.startDate" class="form-control">
              <span>to</span>
              <input type="date" [(ngModel)]="filter.endDate" class="form-control">
            </div>
          </div>

          <div class="form-group" *ngIf="reportType === 'resource'">
            <label>Resource Category</label>
            <select [(ngModel)]="filter.category" class="form-control">
              <option value="all">All Categories</option>
              <option value="equipment">Equipment</option>
              <option value="tools">Tools</option>
              <option value="vehicles">Vehicles</option>
            </select>
          </div>

          <div class="form-group" *ngIf="reportType === 'workforce'">
            <label>Department</label>
            <select [(ngModel)]="filter.department" class="form-control">
              <option value="all">All Departments</option>
              <option value="construction">Construction</option>
              <option value="finishing">Finishing</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
            </select>
          </div>

          <div class="form-group" *ngIf="reportType === 'procurement'">
            <label>Supplier</label>
            <select [(ngModel)]="filter.supplier" class="form-control">
              <option value="all">All Suppliers</option>
              <option value="abc-steel">ABC Steel</option>
              <option value="xyz-cement">XYZ Cement</option>
              <option value="pqr-tools">PQR Tools</option>
            </select>
          </div>

          <div class="form-group">
            <label>Auto Export Formats</label>
            <div class="format-options">
              <label class="format-option">
                <input type="checkbox" [(ngModel)]="exportPDF"> Export PDF/HTML
              </label>
              <label class="format-option">
                <input type="checkbox" [(ngModel)]="exportExcel"> Export CSV/Excel
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-outline" (click)="close()">Cancel</button>
            <button class="btn btn-primary" (click)="generate()">
              Generate Report
            </button>
          </div>
        </div>

        <!-- Generating Progress -->
        <div *ngIf="isGenerating" class="generating-progress">
          <div class="spinner"></div>
          <h3>Generating {{ reportTitle }}...</h3>
          <p>Gathering analytics data and formatting report outputs.</p>
        </div>

        <!-- Generation Success -->
        <div *ngIf="generatedReport && !isGenerating" class="generation-success">
          <div class="success-icon">✅</div>
          <h3>Report Generated Successfully!</h3>
          <p><strong>{{ generatedReport.title }}</strong> has been added to your reports list.</p>
          <div class="success-actions">
            <button class="btn btn-outline" (click)="exportGeneratedPDF()">
              📥 Download PDF
            </button>
            <button class="btn btn-outline" (click)="exportGeneratedExcel()">
              📊 Download CSV
            </button>
            <button class="btn btn-primary" (click)="close()">
              View All Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bt-page {
      padding: 24px;
      max-width: 800px;
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
    .generator-card {
      background: white;
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }
    .generator-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 16px;
    }
    .generator-header h2 {
      margin: 0 0 4px 0;
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
    }
    .subtitle {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }
    .generator-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
    }
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
      color: #0f172a;
      background-color: white;
      box-sizing: border-box;
    }
    .form-control:focus {
      border-color: #2563eb;
      outline: none;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .date-range {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .format-options {
      display: flex;
      gap: 24px;
    }
    .format-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #334155;
      cursor: pointer;
    }
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 12px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }
    .btn {
      padding: 10px 20px;
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
    }
    .generating-progress {
      text-align: center;
      padding: 48px 20px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 20px;
      border: 4px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .generation-success {
      text-align: center;
      padding: 40px 20px;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .generation-success h3 {
      margin: 0 0 8px 0;
      color: #0f172a;
    }
    .generation-success p {
      color: #64748b;
      margin-bottom: 24px;
    }
    .success-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
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

  filter: any = {
    startDate: '',
    endDate: '',
    category: 'all',
    department: 'all',
    supplier: 'all'
  };

  projects: any[] = [];

  constructor(
    private reportService: ReportService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.setDefaultTitle();
    this.reportService.getProjects().subscribe(p => this.projects = p);
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
      project_comprehensive: 'Comprehensive Project Report',
      custom: 'Custom Report'
    };
    this.reportTitle = `${typeNames[this.reportType]} - ${new Date().toLocaleDateString()}`;
  }

  generate() {
    if (!this.reportType) {
      alert('Please select a report type');
      return;
    }
    
    if (this.reportType === 'project_comprehensive' && !this.filter.projectId) {
      alert('Please select a project');
      return;
    }

    this.isGenerating = true;
    this.generatedReport = null;

    const reportFilter: ReportFilter = {
      dateRange: {
        start: this.filter.startDate ? new Date(this.filter.startDate) : new Date(),
        end: this.filter.endDate ? new Date(this.filter.endDate) : new Date()
      },
      projectId: this.filter.projectId
    };

    this.reportService.generateReport(this.reportType, reportFilter).subscribe({
      next: (report: Report) => {
        this.generatedReport = report;
        this.isGenerating = false;
        
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
      if (this.generatedReport.type === 'project_comprehensive') {
        const dataStr = JSON.stringify(this.generatedReport.data, null, 2);
        const html = `<html><head><title>Comprehensive Project Report</title></head><body style="font-family:sans-serif;padding:20px;"><h2>Comprehensive Project Report</h2><pre>${dataStr}</pre></body></html>`;
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.generatedReport!.title}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return;
      }

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
      if (this.generatedReport.type === 'project_comprehensive') {
        const csv = `"Project Comprehensive Report"\n"Please view the PDF/HTML version for structured data."`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.generatedReport!.title}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return;
      }

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