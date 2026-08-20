import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/analytics/procurement-analytics/procurement-analytics.component.html'
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
          <thead><tr><th>Order Status</th><th>Count</th></tr></thead>
          <tbody>
            <tr *ngFor="let s of statusBreakdown">
              <td><span class="bt-badge" [ngClass]="statusClass(s.status)">{{ s.status }}</span></td>
              <td>
                <div class="bt-progress">
                  <div class="bt-progress-bar"><div class="bt-progress-fill blue" [style.width.%]="s.count / maxOrderCount() * 100"></div></div>
                  <span class="bt-progress-value">{{ s.count }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
"""
html_content = re.sub(
    r'<div class="bt-table-wrap">\s*<table class="bt-table">\s*<thead><tr><th>Order Status.*?</table>\s*</div>',
    cat_html,
    html_content,
    flags=re.DOTALL
)

# Insert Vendor Chart
proj_html = """
    <div style="padding: 16px; min-height: 300px;">
      <canvas #vendorChart></canvas>
    </div>
    <div class="bt-table-wrap">
"""
html_content = html_content.replace('<div class="bt-table-wrap">', proj_html, 1)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
