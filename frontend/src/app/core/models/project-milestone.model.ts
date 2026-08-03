export interface ProjectMilestone {
  milestone_id: number;
  project_id: number;

  milestone_name: string;
  description: string | null;

  due_date: string;
  completion_date: string | null;

  status: MilestoneStatus;

  created_at: string;
  updated_at: string;
}

export type MilestoneStatus = 'Pending' | 'In Progress' | 'Completed';

export interface CreateProjectMilestoneRequest {
  project_id: number;

  milestone_name: string;
  description?: string;

  due_date: string;
  status?: MilestoneStatus;
}

export interface UpdateProjectMilestoneRequest {
  milestone_name?: string;
  description?: string;

  due_date?: string;
  completion_date?: string | null;

  status?: MilestoneStatus;
}
