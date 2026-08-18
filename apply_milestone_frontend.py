import os
import re

### 1. Update frontend model
model_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/models/projects.model.ts'
with open(model_path, 'r', encoding='utf-8') as f:
    model_content = f.read()

if "progressPercentage?:" not in model_content:
    model_content = model_content.replace(
        "completionDate?: string;",
        "completionDate?: string;\n  progressPercentage?: number;"
    )
    with open(model_path, 'w', encoding='utf-8') as f:
        f.write(model_content)

### 2. Update projects-data.service.ts mapper
data_service = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/projects-data.service.ts'
with open(data_service, 'r', encoding='utf-8') as f:
    data_content = f.read()

if "progressPercentage:" not in data_content:
    data_content = data_content.replace(
        "completionDate: str(m.completion_date),",
        "completionDate: str(m.completion_date),\n    progressPercentage: m.progress_percentage || 0,"
    )
    # Update createMilestone API call
    create_m_pattern = r"createMilestone\((.*?)\)\s*\{\s*const body = \{"
    create_m_replacement = r"createMilestone(\1) {\n    const body = {"
    data_content = re.sub(create_m_pattern, create_m_replacement, data_content)
    
    # Actually, let's just find `milestone_name: payload.milestoneName,` and add it there
    data_content = data_content.replace(
        "description: payload.description,",
        "description: payload.description,\n      progress_percentage: payload.progressPercentage || 0,"
    )
    with open(data_service, 'w', encoding='utf-8') as f:
        f.write(data_content)

### 3. Update milestone-tracking.component.ts
comp_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/milestone-tracking/milestone-tracking.component.ts'
with open(comp_path, 'r', encoding='utf-8') as f:
    comp_content = f.read()

if "progressPercentage:" not in comp_content:
    comp_content = comp_content.replace(
        "dueDate: ['', Validators.required],",
        "dueDate: ['', Validators.required],\n      progressPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],"
    )
    comp_content = comp_content.replace(
        "dueDate: this.form.value.dueDate,",
        "dueDate: this.form.value.dueDate,\n        progressPercentage: parseInt(this.form.value.progressPercentage, 10),"
    )
    with open(comp_path, 'w', encoding='utf-8') as f:
        f.write(comp_content)

### 4. Update milestone-tracking.component.html
html_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/milestone-tracking/milestone-tracking.component.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

if "formControlName=\"progressPercentage\"" not in html_content:
    # Add input to form
    input_box = """
        <label>
          <span>Progress Weight (%)</span>
          <input type="number" formControlName="progressPercentage" min="0" max="100" placeholder="e.g. 25" />
        </label>
        <label class="bt-col-span-2">
"""
    html_content = html_content.replace('<label class="bt-col-span-2">', input_box)
    
    # Show percentage in the list
    badge_html = """<span class="bt-badge" [ngClass]="{
                  'gray': m.status==='Pending',
                  'blue': m.status==='In Progress',
                  'green': m.status==='Completed'
                }">{{ m.status }}</span>"""
    new_badge = badge_html + """\n                <span class="bt-badge purple" style="margin-left:8px;" *ngIf="m.progressPercentage">+{{ m.progressPercentage }}%</span>"""
    
    html_content = html_content.replace(badge_html, new_badge)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

