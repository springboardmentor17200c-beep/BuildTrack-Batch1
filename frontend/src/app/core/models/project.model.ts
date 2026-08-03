export interface Project {
  project_id: number;
  company_id: number;
  manager_id: number;
  client_id: number;

  category_id: number;
  status_id: number;

  project_name: string;
  description: string | null;
  location: string;

  start_date: string;
  expected_end_date: string;
  actual_end_date: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  company_id: number;
  manager_id: number;
  client_id: number;

  category_id: number;

  project_name: string;
  description?: string;
  location: string;

  start_date: string;
  expected_end_date: string;
}

export interface UpdateProjectRequest {
  manager_id?: number;
  client_id?: number;

  category_id?: number;
  status_id?: number;

  project_name?: string;
  description?: string;
  location?: string;

  start_date?: string;
  expected_end_date?: string;
  actual_end_date?: string | null;
}

export interface ProjectCategory {
  category_id: number;
  category_name: string;
  description: string | null;
}

export interface ProjectStatus {
  status_id: number;
  status_name: string;
  description: string | null;
}
