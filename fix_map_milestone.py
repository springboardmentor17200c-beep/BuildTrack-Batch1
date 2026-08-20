import os
import re

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
  completion_date?: string | null;
  status: string;
}"""

new_interface = """interface ApiMilestone {
  milestone_id: number;
  project_id: number;
  project_name: string;
  milestone_name: string;
  description: string | null;
  due_date: string;
  completion_date?: string | null;
  status: string;
  progress_percentage: number;
}"""

ts_content = ts_content.replace(old_interface, new_interface)

old_map = """function mapMilestone(a: ApiMilestone): ProjectMilestone {
  return {
    milestoneId: `M-${a.milestone_id}`,
    projectId: `P-${a.project_id}`,
    projectName: a.project_name,
    milestoneName: a.milestone_name,
    description: a.description ?? '',
    dueDate: a.due_date,
    completionDate: a.completion_date,
    status: a.status as MilestoneStatus,
  };
}"""

new_map = """function mapMilestone(a: ApiMilestone): ProjectMilestone {
  return {
    milestoneId: `M-${a.milestone_id}`,
    projectId: `P-${a.project_id}`,
    projectName: a.project_name,
    milestoneName: a.milestone_name,
    description: a.description ?? '',
    dueDate: a.due_date,
    completionDate: a.completion_date,
    status: a.status as MilestoneStatus,
    progressPercentage: a.progress_percentage || 0,
  };
}"""

ts_content = ts_content.replace(old_map, new_map)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
