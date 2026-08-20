import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/analytics/budget-analytics/budget-analytics.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

import re

# Insert Category Chart
cat_html = """
    <div class="bt-table-wrap" style="display: flex; gap: 24px;">
      <div style="flex: 1; min-height: 250px;">
        <canvas #categoryChart></canvas>
      </div>
      <div style="flex: 1;">
        <table class="bt-table">
          <thead><tr><th>Category</th><th>Amount</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of categoryBreakdown">
              <td class="bt-strong">{{ c.category }}</td>
              <td>
                <div class="bt-progress">
                  <div class="bt-progress-bar" style="width:180px;"><div class="bt-progress-fill blue" [style.width.%]="c.percent"></div></div>
                  <span class="bt-progress-value" style="min-width:110px;">\u20b9{{ c.amount | number }}</span>
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

# Insert Project Chart
proj_html = """
    <div style="padding: 16px; min-height: 300px;">
      <canvas #projectChart></canvas>
    </div>
    <div class="bt-table-wrap">
"""
html_content = html_content.replace('<div class="bt-table-wrap">', proj_html, 1) # Only first instance of remaining bt-table-wrap, but we replaced the first one already? Wait!

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
