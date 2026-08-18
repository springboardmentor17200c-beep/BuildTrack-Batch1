import os
import re

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/projects-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Replace local addMilestone with POST
old_add = """  addMilestone(milestone: ProjectMilestone) {
    this.milestones$$.next([milestone, ...this.milestones$$.value]);
  }"""

new_add = """  addMilestone(milestone: ProjectMilestone) {
    const numericProjectId = parseInt(milestone.projectId.replace('P-', ''), 10);
    const body = {
      project_id: numericProjectId,
      milestone_name: milestone.milestoneName,
      description: milestone.description,
      due_date: milestone.dueDate,
      status: milestone.status,
      progress_percentage: milestone.progressPercentage || 0
    };
    
    this.http.post(`${this.apiUrl}/project-milestones`, body, { headers: this.headers() }).subscribe({
      next: () => this.loadAll(),
      error: err => console.error('Failed to create milestone', err)
    });
  }"""

if old_add in ts_content:
    ts_content = ts_content.replace(old_add, new_add)
else:
    print("Could not find old addMilestone")

# Also markMilestoneStatus does PUT but doesn't handle progress_percentage.
# In `apply_milestone_frontend.py` I might have missed updating `milestone: ProjectMilestone = { ... }` inside `submit()` to include `progressPercentage`.

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)


### Update milestone tracking submit() to pass progressPercentage ###
comp_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/milestone-tracking/milestone-tracking.component.ts'
with open(comp_path, 'r', encoding='utf-8') as f:
    comp_content = f.read()

if "progressPercentage: parseInt" not in comp_content:
    comp_content = comp_content.replace(
        "const { projectId, milestoneName, description, dueDate } = this.form.value;",
        "const { projectId, milestoneName, description, dueDate, progressPercentage } = this.form.value;"
    )
    comp_content = comp_content.replace(
        "status: 'Pending',",
        "status: 'Pending',\n      progressPercentage: parseInt(progressPercentage, 10) || 0,"
    )
    with open(comp_path, 'w', encoding='utf-8') as f:
        f.write(comp_content)
