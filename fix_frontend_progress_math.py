import os
import re

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/projects-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

old_get_progress = """  getProgress(projectId: string): number {
    const rows = this.milestones$$.value.filter(m => m.projectId === projectId);
    if (rows.length === 0) return 0;
    const completed = rows.filter(m => m.status === 'Completed').length;
    return Math.round((completed / rows.length) * 100);
  }"""

new_get_progress = """  getProgress(projectId: string): number {
    const rows = this.milestones$$.value.filter(m => m.projectId === projectId);
    if (rows.length === 0) return 0;
    const completedRows = rows.filter(m => m.status === 'Completed');
    const totalPercentage = completedRows.reduce((sum, m) => sum + (m.progressPercentage || 0), 0);
    return Math.min(100, totalPercentage);
  }"""

if old_get_progress in ts_content:
    ts_content = ts_content.replace(old_get_progress, new_get_progress)
else:
    print("Could not find getProgress method")

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

