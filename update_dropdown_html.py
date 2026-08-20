import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-allocation/resource-allocation.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

old_option = """<option *ngFor="let r of availableResources" [value]="r.resourceId">{{ r.resourceName }} ({{ r.category }})</option>"""
new_option = """<option *ngFor="let r of availableResources" [value]="r.resourceId">{{ r.resourceName }} - {{ r.currentStatus }}</option>"""
html_content = html_content.replace(old_option, new_option)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
