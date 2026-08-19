import os

filepath = 'frontend/buildtrack-frontend/src/app/models/components/analytics/report-generator.component.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure error handling is robust
old_error = """      error: (err: any) => {
        console.error('Error generating report:', err);
        alert('Failed to generate report.');
        this.isGenerating = false;
      }"""

new_error = """      error: (err: any) => {
        console.error('Error generating report:', err);
        alert('Failed to generate report: ' + (err.message || JSON.stringify(err)));
        this.isGenerating = false;
        this.generatedReport = null;
      }"""

content = content.replace(old_error, new_error)

# Also patch exportReportToPDF inside report-generator to handle errors
old_export = """        this.reportService.exportReportToPDF(report.id).subscribe((blob: Blob) => {
          blob.text().then(text => {
            this.reportHtml = this.sanitizer.bypassSecurityTrustHtml(text);
          });
        });"""

new_export = """        this.reportService.exportReportToPDF(report.id).subscribe({
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
        });"""

content = content.replace(old_export, new_export)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
