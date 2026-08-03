export interface ProjectView {
  project_id: number;

  project_name: string;
  description: string | null;

  location: string;

  manager_name: string;
  client_name: string;

  category_name: string;
  status_name: string;

  start_date: string;
  expected_end_date: string;
  actual_end_date: string | null;

  progress: number;
}
