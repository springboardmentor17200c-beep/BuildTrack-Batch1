import os

filepath = 'frontend/buildtrack-frontend/src/app/models/components/analytics/report-generator.component.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Restore loading spinner
loading_spinner = """
      <!-- Selection Grid -->
      <div class="report-selection-grid" *ngIf="!isGenerating && !generatedReport">"""
content = content.replace('      <!-- Selection Grid -->\n      <div class="report-selection-grid" *ngIf="!generatedReport">', loading_spinner)

loading_html = """
      <!-- Generating Progress -->
      <div *ngIf="isGenerating" class="bt-panel" style="padding: 60px; text-align: center;">
        <div style="width: 40px; height: 40px; border: 3px solid var(--bt-panel-border); border-top-color: var(--bt-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <h3 class="bt-title">Gathering Data...</h3>
        <p class="bt-subtitle" style="margin-top: 8px;">Compiling live database records for your report.</p>
      </div>

      <!-- Generation Success / Live Preview -->"""
content = content.replace('      <!-- Generation Success / Live Preview -->', loading_html)

# Add a timeout to the HTTP requests to prevent infinite hanging
# We'll do this in report.service.ts later

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
