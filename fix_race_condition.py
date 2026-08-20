import os
import re

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/projects-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

old_emit = """      this.projects$$.next(projects.map(mapProject));
      this.milestones$$.next(milestones.map(mapMilestone));"""

new_emit = """      this.milestones$$.next(milestones.map(mapMilestone));
      this.projects$$.next(projects.map(mapProject));"""

if old_emit in ts_content:
    ts_content = ts_content.replace(old_emit, new_emit)
else:
    print("Could not find emit order to replace")

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
