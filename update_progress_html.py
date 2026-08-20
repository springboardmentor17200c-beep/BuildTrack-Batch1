import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/analytics/progress-analytics/progress-analytics.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

import re

# Insert Status Chart
cat_html = """
    <div class="bt-table-wrap" style="display: flex; gap: 24px;">
      <div style="flex: 1; min-height: 250px;">
        <canvas #statusChart></canvas>
      </div>
      <div style="flex: 1;">
        <table class="bt-table">
          <thead><tr><th>Category</th><th>Count</th><th>Avg Progress</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of categorySummaries">
              <td class="bt-strong">{{ c.category }}</td>
              <td>{{ c.count }}</td>
              <td>
                <div class="bt-progress">
                  <div class="bt-progress-bar"><div class="bt-progress-fill" [ngClass]="progressColor(c.avgProgress)" [style.width.%]="c.avgProgress"></div></div>
                  <span class="bt-progress-value">{{ c.avgProgress }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
"""
html_content = re.sub(
    r'<div class="bt-table-wrap">\s*<table class="bt-table">\s*<thead><tr><th>Category.*?</table>\s*</div>',
    cat_html,
    html_content,
    flags=re.DOTALL
)

# Insert Completion Chart
proj_html = """
    <div style="padding: 16px; min-height: 300px;">
      <canvas #completionChart></canvas>
    </div>
    <div class="bt-table-wrap">
"""
html_content = html_content.replace('<div class="bt-table-wrap">', proj_html, 1)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
