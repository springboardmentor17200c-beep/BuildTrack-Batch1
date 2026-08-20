// Shared types for authentication screens.
// Field names mirror the real FastAPI backend (routes/auth.py, models.py).

export type RoleName =
  | 'Administrator'
  | 'Project Manager'
  | 'Site Engineer'
  | 'Contractor'
  | 'Worker'
  | 'Client / Owner'
  | 'Vendor';

  export interface AppUser {
    userId: string;
    username: string;
    fullName: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: RoleName;
    companyName?: string;
    companyId?: number;
    taxId?: string;
    employeeId?: string;
    skillsOrTrade?: string;
    assignedProjects: string[];
    isActive: boolean;
    createdAt?: string;
    profileImage?: string;
  }

// POST /login expects OAuth2 form fields: username + password (not email).
export interface LoginPayload {
  username: string;
  password: string;
}

// POST /register — matches RegistrationRequest in models.py exactly.
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: RoleName;
  companyName?: string;
  taxId?: string;
  employeeId?: string;
  skillsOrTrade?: string;
}

export interface ProfileUpdatePayload {
  fullName: string;
  phoneNumber: string;
  profileImage?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// Which roles can access which modules. Kept from the earlier Contractor
// bug fix — Contractor is included in inventory/workforce access.
export const MODULE_ACCESS: Record<string, RoleName[]> = {
  resources: ['Administrator', 'Project Manager', 'Site Engineer'],
  inventory: ['Administrator', 'Project Manager', 'Site Engineer', 'Contractor'],
  workforce: ['Administrator', 'Project Manager', 'Site Engineer', 'Contractor'],
  analytics: ['Administrator', 'Project Manager'],
  projects: ['Administrator', 'Project Manager', 'Site Engineer', 'Contractor'],
  procurement: ['Administrator', 'Project Manager', 'Site Engineer', 'Vendor'],
  'dashboard-admin': ['Administrator'],
  'dashboard-pm': ['Project Manager'],
  'dashboard-site-engineer': ['Site Engineer'],
  'dashboard-contractor': ['Contractor'],
  'dashboard-client': ['Client / Owner'],
  'dashboard-worker': ['Worker'],
};

// Maps each role to its dashboard route — used right after login.
export const DASHBOARD_ROUTE_BY_ROLE: Record<RoleName, string> = {
  Administrator: '/dashboard/admin',
  'Project Manager': '/dashboard/pm',
  'Site Engineer': '/dashboard/site-engineer',
  Contractor: '/dashboard/contractor',
  Worker: '/dashboard/worker',
  'Client / Owner': '/dashboard/client',
  Vendor: '/procurement/vendor-dashboard',
};