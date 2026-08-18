import os

html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/workforce/worker-dashboard/worker-dashboard.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Change Employee Code to User ID
html_content = html_content.replace('<span>Employee Code</span>', '<span>User ID</span>')
html_content = html_content.replace('placeholder="e.g. EMP-1042"', 'placeholder="e.g. EMP-1042"') # Keeps same placeholder

# Remove Project
project_label = """      <label>
        <span>Project</span>
        <select formControlName="project">
          <option value="" disabled selected>Select project</option>
          <option *ngFor="let p of projectNames" [value]="p">{{ p }}</option>
        </select>
      </label>"""
html_content = html_content.replace(project_label, '')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
