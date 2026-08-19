import os

# 1. Update report-dashboard.component.ts
dash_path = 'frontend/buildtrack-frontend/src/app/models/components/analytics/report-dashboard.component.ts'
with open(dash_path, 'r', encoding='utf-8') as f:
    dash_content = f.read()

old_search = 'style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--bt-panel-border); min-width: 250px;"'
new_search = 'style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--bt-panel-border); min-width: 250px; background: var(--bt-panel-bg); color: var(--text-primary); outline: none;"'
dash_content = dash_content.replace(old_search, new_search)

with open(dash_path, 'w', encoding='utf-8') as f:
    f.write(dash_content)

# 2. Update report-generator.component.ts
gen_path = 'frontend/buildtrack-frontend/src/app/models/components/analytics/report-generator.component.ts'
with open(gen_path, 'r', encoding='utf-8') as f:
    gen_content = f.read()

# Fix Back Button
old_back = """<button class="bt-back-btn" routerLink="/analytics">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>
        </svg>
        Back to Analytics
      </button>"""
new_back = """<button class="bt-back-btn" routerLink="/analytics/reports">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>
        </svg>
        Back to Reports Dashboard
      </button>"""
gen_content = gen_content.replace(old_back, new_back)

# Remove Loading Screen
old_loading = """      <!-- Generating Progress -->
      <div *ngIf="isGenerating" class="bt-panel" style="padding: 60px; text-align: center;">
        <div style="width: 40px; height: 40px; border: 3px solid var(--bt-panel-border); border-top-color: var(--bt-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <h3 class="bt-title">Gathering Data...</h3>
        <p class="bt-subtitle" style="margin-top: 8px;">Compiling live database records for your report.</p>
      </div>"""
gen_content = gen_content.replace(old_loading, "")

# Remove isGenerating from Selection Grid
gen_content = gen_content.replace('*ngIf="!isGenerating && !generatedReport"', '*ngIf="!generatedReport"')

# Remove isGenerating from Preview Panel
gen_content = gen_content.replace('*ngIf="generatedReport && !isGenerating"', '*ngIf="generatedReport"')

with open(gen_path, 'w', encoding='utf-8') as f:
    f.write(gen_content)
