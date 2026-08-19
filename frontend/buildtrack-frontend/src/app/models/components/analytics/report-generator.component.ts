import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReportService } from '../../../services/report.service';
import { Report, ReportType } from '../../../models/report.model';

@Component({
  selector: 'app-report-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bt-page">
      <button class="bt-back-btn" routerLink="/analytics/reports">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>
        </svg>
        Back to Reports Dashboard
      </button>

      <div class="bt-topbar">
        <div>
          <h1 class="bt-title">Generate New Report</h1>
          <p class="bt-subtitle">Instantly generate live aggregate reports across all your projects.</p>
        </div>
      </div>


      <!-- Selection Grid -->
      <div class="report-selection-grid" *ngIf="!isGenerating && !generatedReport">
        
        <div class="report-card" (click)="generate('progress')">
          <div class="rc-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">📊</div>
          <h3>Progress Report</h3>
          <p>Real-time completion percentages, milestones, and timeline status of all projects.</p>
        </div>

        <div class="report-card" (click)="generate('budget')">
          <div class="rc-icon" style="background: rgba(34, 197, 94, 0.1); color: #22c55e;">💰</div>
          <h3>Budget Report</h3>
          <p>Live budget vs actual spend tracking, including labor and material costs.</p>
        </div>

        <div class="report-card" (click)="generate('procurement')">
          <div class="rc-icon" style="background: rgba(234, 179, 8, 0.1); color: #eab308;">📦</div>
          <h3>Procurement Report</h3>
          <p>Vendor performance, active purchase orders, and total material spend analysis.</p>
        </div>

      </div>




      <!-- Generating Progress -->
      <div *ngIf="isGenerating" class="bt-panel" style="padding: 60px; text-align: center;">
        <div style="width: 40px; height: 40px; border: 3px solid var(--bt-panel-border); border-top-color: var(--bt-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <h3 class="bt-title">Gathering Data...</h3>
        <p class="bt-subtitle" style="margin-top: 8px;">Compiling live database records for your report.</p>
      </div>

      <!-- Generation Success / Live Preview -->
      <div *ngIf="generatedReport" class="bt-panel" style="display: flex; flex-direction: column; height: 850px; padding: 0;">
        <div style="padding: 20px 24px; border-bottom: 1px solid var(--bt-panel-border); display: flex; justify-content: space-between; align-items: center; background: var(--bt-panel-bg);">
          <div>
            <h3 class="bt-title" style="margin: 0; color: var(--text-primary); font-size: 18px;">✅ {{ generatedReport.title }}</h3>
            <p class="bt-subtitle" style="margin: 4px 0 0 0;">Live Report Preview</p>
          </div>
          <div style="display: flex; gap: 12px;">
            <button class="bt-filter-btn" (click)="reset()">
              ← Back to Reports
            </button>
            <button class="bt-add-btn" (click)="exportGeneratedPDF()" style="background: #3b82f6; color: white;">
              📥 Download HTML
            </button>
            <button class="bt-filter-btn" (click)="exportGeneratedExcel()">
              📊 Download CSV
            </button>
          </div>
        </div>
        <div style="flex: 1; background: var(--bt-body-bg); padding: 24px; overflow-y: auto; display: flex; justify-content: center;">
          <iframe 
            [srcdoc]="reportHtml" 
            style="width: 100%; max-width: 1000px; height: 100%; min-height: 1000px; border: none; background: #ffffff; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);"
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
    .report-selection-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-top: 16px;
    }
    .report-card {
      background: var(--bt-panel-bg);
      border: 1px solid var(--bt-panel-border);
      border-radius: 12px;
      padding: 32px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .report-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 20px rgba(0,0,0,0.08);
      border-color: var(--bt-blue);
    }
    .rc-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin: 0 auto 20px;
    }
    .report-card h3 {
      margin: 0 0 12px 0;
      font-size: 18px;
      color: var(--text-primary);
    }
    .report-card p {
      margin: 0;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  `]
})
export class ReportGeneratorComponent implements OnInit {
  isGenerating = false;
  generatedReport: Report | null = null;
  reportHtml: SafeHtml | string = '';

  constructor(
    private reportService: ReportService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {}

  reset() {
    this.generatedReport = null;
    this.reportHtml = '';
  }

  generate(type: ReportType) {

    this.isGenerating = true;
    this.generatedReport = null;

    const reportFilter = {
      dateRange: { start: new Date(), end: new Date() }
    };

    this.reportService.generateReport(type, reportFilter).subscribe({
      next: (report: Report) => {
        this.generatedReport = report;
        this.isGenerating = false;
        
        // Generate the HTML for the iframe preview
        this.reportService.exportReportToPDF(report.id).subscribe({
          next: (blob: Blob) => {
            blob.text().then(text => {
              this.reportHtml = this.sanitizer.bypassSecurityTrustHtml(text);
            }).catch(err => {
              console.error('Blob text error:', err);
              alert('Error reading report HTML');
            });
          },
          error: (err: any) => {
            console.error('PDF Export Error:', err);
            alert('Failed to render report preview: ' + (err.message || err));
          }
        });
      },
      error: (err: any) => {
        console.error('Error generating report:', err);
        alert('Failed to generate report: ' + (err.message || JSON.stringify(err)));
        this.isGenerating = false;
        this.generatedReport = null;
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