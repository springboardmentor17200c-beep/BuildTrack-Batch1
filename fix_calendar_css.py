import os

css_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/dashboards/worker-dashboard/worker-dashboard.component.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

css_content = css_content.replace('var(--bt-text-muted)', 'var(--bt-muted)')
css_content = css_content.replace('var(--bt-surface-color)', 'var(--bt-panel-bg)')
css_content = css_content.replace('var(--bt-border-color)', 'var(--bt-panel-border)')
css_content = css_content.replace('var(--bt-text-color)', 'var(--bt-text)')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)
