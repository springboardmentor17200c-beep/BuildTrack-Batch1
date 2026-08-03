export interface LookupItem {
  id: number;
  name: string;
  description: string | null;
}

export interface RoleLookup extends LookupItem {
  id: number; // role_id
  name: string; // role_name
}

export interface CompanyLookup {
  company_id: number;
  company_name: string;
  company_code: string;
}

export interface ProjectCategoryLookup extends LookupItem {
  id: number; // category_id
  name: string; // category_name
}

export interface ProjectStatusLookup extends LookupItem {
  id: number; // status_id
  name: string; // status_name
}

export interface WorkforceCategoryLookup extends LookupItem {
  id: number; // workforce_category_id
  name: string; // category_name
}

export interface ResourceCategoryLookup extends LookupItem {
  id: number; // resource_category_id
  name: string; // category_name
}

export interface MaterialCategoryLookup extends LookupItem {
  id: number; // material_category_id
  name: string; // category_name
}

export interface ExpenseCategoryLookup extends LookupItem {
  id: number; // expense_category_id
  name: string; // category_name
}

export interface ProgressCategoryLookup extends LookupItem {
  id: number; // progress_category_id
  name: string; // category_name
}

export interface LookupResponse {
  roles: RoleLookup[];
  companies: CompanyLookup[];
  project_categories: ProjectCategoryLookup[];
  project_statuses: ProjectStatusLookup[];
  workforce_categories: WorkforceCategoryLookup[];
  resource_categories: ResourceCategoryLookup[];
  material_categories: MaterialCategoryLookup[];
  expense_categories: ExpenseCategoryLookup[];
  progress_categories: ProgressCategoryLookup[];
}
