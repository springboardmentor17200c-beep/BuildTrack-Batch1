import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/projects/projects-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

old_interface = """interface ApiMilestone {
  milestone_id: number;
  project_id: number;
  project_name: string;
  milestone_name: string;
  description: string | null;
  due_date: string;
  completion_date: string | null;
  status: string;
}"""

new_interface = """interface ApiMilestone {
  milestone_id: number;
  project_id: number;
  project_name: string;
  milestone_name: string;
  description: string | null;
  due_date: string;
  completion_date: string | null;
  status: string;
  progress_percentage: number;
}"""

if old_interface in ts_content:
    ts_content = ts_content.replace(old_interface, new_interface)
else:
    print("Could not find ApiMilestone")

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
