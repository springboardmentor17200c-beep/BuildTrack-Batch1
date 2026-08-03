export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: TokenResponse;
    user: CurrentUser;
  };
}

export interface CurrentUser {
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string;

  company_id: number | null;
  company_name: string | null;

  role_id: number;
  role_name: string;

  registration_status?: string;

  profile_image: string | null;

  is_active: boolean;

  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CompanyRegistrationRequest {
  company_name: string;
  company_email: string;
  company_phone: string;
  address: string;

  admin_name: string;
  admin_email: string;
  admin_phone: string;
  password: string;
}

export interface EmployeeRegistrationRequest {
  full_name: string;
  email: string;
  password: string;
  phone_number: string;

  company_code: string;

  role_id: number;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface RequestOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  verification_token: string;
}

export interface ResetPasswordRequest {
  email: string;
  verification_token: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone_number?: string;
  profile_image?: string;
}

export interface LookupItem {
  id: number;
  name: string;
  description: string | null;
}

export interface LookupResponse {
  roles: LookupItem[];
  project_categories: LookupItem[];
  project_statuses: LookupItem[];
  resource_categories: LookupItem[];
  material_categories: LookupItem[];
  workforce_categories: LookupItem[];
}

export interface CompanyRegistrationData {
  company_id: number;
  company_code: string;
  token: TokenResponse;
  user: CurrentUser;
}

export interface EmployeeRegistrationData {
  user_id: number;
  registration_status: string;
}

export const ROLE_NAMES = [
  'Administrator',
  'Project Manager',
  'Site Engineer',
  'Contractor',
  'Worker',
  'Client',
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export const EMPLOYEE_REGISTRATION_ROLES = [
  'Project Manager',
  'Site Engineer',
  'Contractor',
  'Worker',
] as const satisfies readonly RoleName[];

export const MODULE_ACCESS: Record<string, readonly RoleName[]> = {
  resources: ['Administrator', 'Project Manager', 'Site Engineer'],
  inventory: ['Administrator', 'Project Manager', 'Site Engineer', 'Contractor'],
  workforce: ['Administrator', 'Project Manager', 'Site Engineer', 'Contractor'],
  analytics: ['Administrator', 'Project Manager'],
  projects: ['Administrator', 'Project Manager', 'Site Engineer', 'Contractor'],

  'dashboard-admin': ['Administrator'],
  'dashboard-pm': ['Project Manager'],
  'dashboard-site-engineer': ['Site Engineer'],
  'dashboard-contractor': ['Contractor'],
  'dashboard-client': ['Client'],
};

export type ModuleAccessKey = keyof typeof MODULE_ACCESS;

export function isModuleAccessKey(value: string): value is ModuleAccessKey {
  return Object.prototype.hasOwnProperty.call(MODULE_ACCESS, value);
}

export function userHasAccess(user: CurrentUser, accessTargets: readonly string[]): boolean {
  const allowedRoles = accessTargets.flatMap((target) =>
    isModuleAccessKey(target) ? MODULE_ACCESS[target] : [target as RoleName],
  );

  return allowedRoles.includes(user.role_name as RoleName);
}
