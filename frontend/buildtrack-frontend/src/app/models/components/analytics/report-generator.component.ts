import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService } from '../../../services/report.service';
import { Report, ReportFilter, ReportType } from '../../../models/report.model';

@Component({
  selector: 'app-report-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="report-generator">
      <div class="generator-header">
        <h2>Generate New Report</h2>
        <button class="btn btn-outline" (click)="close()">
          <mat-icon>close</mat-icon> Close
        </button>
      </div>

      <div class="generator-form">
        <div class="form-group">
          <label>Report Type *</label>
          <select [(ngModel)]="reportType" (change)="onTypeChange()">
            <option value="progress">📊 Progress Report</option>
            <option value="resource">🔧 Resource Report</option>
            <option value="budget">💰 Budget Report</option>
            <option value="workforce">👷 Workforce Report</option>
            <option value="procurement">📦 Procurement Report</option>
          </select>
        </div>

        <div class="form-group">
          <label>Report Title</label>
          <input type="text" [(ngModel)]="reportTitle" placeholder="Enter report title">
        </div>

        <div class="form-group">
          <label>Date Range</label>
          <div class="date-range">
            <input type="date" [(ngModel)]="filter.startDate">
            <span>to</span>
            <input type="date" [(ngModel)]="filter.endDate">
          </div>
        </div>

        <div class="form-group" *ngIf="reportType === 'resource'">
          <label>Resource Category</label>
          <select [(ngModel)]="filter.category">
            <option value="all">All Categories</option>
            <option value="equipment">Equipment</option>
            <option value="tools">Tools</option>
            <option value="vehicles">Vehicles</option>
          </select>
        </div>

        <div class="form-group" *ngIf="reportType === 'workforce'">
          <label>Department</label>
          <select [(ngModel)]="filter.department">
            <option value="all">All Departments</option>
            <option value="construction">Construction</option>
            <option value="finishing">Finishing</option>
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
          </select>
        </div>

        <div class="form-group" *ngIf="reportType === 'procurement'">
          <label>Supplier</label>
          <select [(ngModel)]="filter.supplier">
            <option value="all">All Suppliers</option>
            <option value="abc-steel">ABC Steel</option>
            <option value="xyz-cement">XYZ Cement</option>
            <option value="pqr-tools">PQR Tools</option>
          </select>
        </div>

        <div class="form-group">
          <label>Format</label>
          <div class="format-options">
            <label class="format-option">
              <input type="checkbox" [(ngModel)]="exportPDF"> PDF
            </label>
            <label class="format-option">
              <input type="checkbox" [(ngModel)]="exportExcel"> Excel
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" (click)="close()">Cancel</button>
          <button class="btn btn-primary" (click)="generate()" [disabled]="isGenerating">
            <mat-icon *ngIf="!isGenerating">play_arrow</mat-icon>
            <span *ngIf="!isGenerating">Generate Report</span>
            <span *ngIf="isGenerating">Generating...</span>
          </button>
        </div>
      </div>

      <!-- Progress -->
      <div *ngIf="isGenerating" class="generating-progress">
        <div class="spinner"></div>
        <p>Generating your report...</p>
      </div>

      <!-- Success -->
      <div *ngIf="generatedReport" class="generation-success">
        <mat-icon class="success-icon">check_circle</mat-icon>
        <h3>Report Generated Successfully!</h3>
        <p>{{ generatedReport.title }}</p>
        <div class="success-actions">
          <button class="btn btn-primary" (click)="viewGeneratedReport()">
            <mat-icon>visibility</mat-icon> View Report
          </button>
          <button class="btn btn-outline" (click)="exportGeneratedPDF()">
            <mat-icon>picture_as_pdf</mat-icon> Download PDF
          </button>
          <button class="btn btn-outline" (click)="exportGeneratedExcel()">
            <mat-icon>table_chart</mat-icon> Download Excel
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .report-generator {
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }
    .generator-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .generator-header h2 {
      margin: 0;
      font-size: 20px;
      color: #1a1a1a;
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
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .btn-secondary {
      background: #f5f5f5;
      color: #555;
    }
    .btn-secondary:hover {
      background: #e0e0e0;
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
      font-size: 18px;
      width: 18px;
      height: 18px;
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
      font-weight: 500;
      color: #555;
    }
    .form-group select,
    .form-group input {
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    .form-group select:focus,
    .form-group input:focus {
      border-color: #3f51b5;
      outline: none;
    }
    .date-range {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .date-range input {
      flex: 1;
    }
    .format-options {
      display: flex;
      gap: 20px;
    }
    .format-option {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      cursor: pointer;
    }
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 8px;
    }
    .generating-progress {
      text-align: center;
      padding: 40px 20px;
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
    .generation-success {
      text-align: center;
      padding: 40px 20px;
    }
    .success-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
    }
    .generation-success h3 {
      margin: 16px 0 8px 0;
      color: #1a1a1a;
    }
    .generation-success p {
      color: #666;
      margin-bottom: 20px;
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

  constructor(private reportService: ReportService) {}

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
        
        // Auto-download based on format selection
        if (this.exportPDF) {
          this.exportGeneratedPDF();
        }
        if (this.exportExcel) {
          this.exportGeneratedExcel();
        }
      },
      error: (err: any) => {
        console.error('Error generating report:', err);
        alert('Failed to generate report. Please try again.');
        this.isGenerating = false;
      }
    });
  }

  viewGeneratedReport() {
    if (this.generatedReport) {
      console.log('View report:', this.generatedReport);
      // Implement view
    }
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
    // Close dialog or navigate back
    console.log('Close generator');
  }
}