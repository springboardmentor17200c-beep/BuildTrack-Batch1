// Shared types for Project Management.
// Field names mirror the BuildTrack database schema:
//   projects, project_categories, project_statuses, project_milestones

export type ProjectCategory =
  'Residential' | 'Commercial' | 'Industrial' | 'Infrastructure' | 'Government';

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed';

// Maps to the `projects` table.
export interface Project {
  projectId: string;
  projectName: string;
  description: string;
  location: string;
  category: ProjectCategory;
  status: ProjectStatus;
  manager: string;
  client: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate: string | null; // set only once the project is closed
}

// Maps to the `project_milestones` table.
export type MilestoneStatus = 'Pending' | 'In Progress' | 'Completed';

export interface ProjectMilestone {
  milestoneId: string;
  projectId: string;
  projectName: string; // denormalized for display only
  milestoneName: string;
  description: string;
  dueDate: string;
  completionDate: string | null;
  status: MilestoneStatus;
}
