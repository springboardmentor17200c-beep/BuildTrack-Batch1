import os

filepath = 'frontend/buildtrack-frontend/src/app/models/components/analytics/report-generator.component.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Import DomSanitizer and SafeHtml
content = content.replace("import { Component, OnInit } from '@angular/core';", "import { Component, OnInit } from '@angular/core';\nimport { DomSanitizer, SafeHtml } from '@angular/platform-browser';")

# Add template section for iframe
success_panel_old = """      <!-- Generation Success -->
      <div *ngIf="generatedReport && !isGenerating" class="bt-panel" style="padding: 60px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
        <h3 class="bt-title">Report Generated Successfully!</h3>
        <p class="bt-subtitle" style="margin-top: 8px;"><strong>{{ generatedReport.title }}</strong> has been added to your reports list.</p>
        
        <div style="display: flex; gap: 12px; justify-content: center; margin-top: 32px;">
          <button class="bt-filter-btn" (click)="exportGeneratedPDF()">
            📥 Download PDF
          </button>
          <button class="bt-filter-btn" (click)="exportGeneratedExcel()">
            📊 Download CSV
          </button>
          <button class="bt-add-btn" (click)="close()">
            View All Reports
          </button>
        </div>
      </div>"""

success_panel_new = """      <!-- Generation Success / Live Preview -->
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
      </div>"""
content = content.replace(success_panel_old, success_panel_new)

# Add reportHtml variable
content = content.replace("exportExcel = false;", "exportExcel = false;\n  reportHtml: SafeHtml | string = '';")

# Inject DomSanitizer
content = content.replace("private location: Location\n  ) {}", "private location: Location,\n    private sanitizer: DomSanitizer\n  ) {}")

# Update generate() next handler
generate_next_old = """      next: (report: Report) => {
        this.generatedReport = report;
        this.isGenerating = false;
        
        if (this.exportPDF) {
          this.exportGeneratedPDF();
        }
        if (this.exportExcel) {
          this.exportGeneratedExcel();
        }
      },"""

generate_next_new = """      next: (report: Report) => {
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
      },"""
content = content.replace(generate_next_old, generate_next_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
