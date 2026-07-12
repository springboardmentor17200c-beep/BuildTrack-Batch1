// Shared types for authentication screens.
// Field names mirror the BuildTrack database schema: `users`, `roles`.

export type RoleName =
  | 'Administrator'
  | 'Project Manager'
  | 'Site Engineer'
  | 'Contractor'
  | 'Worker'
  | 'Client';

// Maps to the `users` table. password is never stored/read back in plain
// text in a real system — password_hash only. Kept here only so the mock
// service can "check" a login without a real backend.
export interface AppUser {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: RoleName;
  isActive: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: RoleName;
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

// Which roles can access which modules. Adjust freely as your team firms
// up the real access rules — this is a starting point based on how the
// SRS describes each role's responsibilities (e.g. Workers and Clients
// aren't described as managing resources/inventory/procurement, so
// they're left out of those modules here).
export const MODULE_ACCESS: Record<string, RoleName[]> = {
  resources: ['Administrator', 'Project Manager', 'Site Engineer'],
  inventory: ['Administrator', 'Project Manager', 'Site Engineer', 'Contractor'],
  workforce: ['Administrator', 'Project Manager', 'Site Engineer', 'Contractor'],
  analytics: ['Administrator', 'Project Manager'],
  'dashboard-admin': ['Administrator'],
  'dashboard-pm': ['Project Manager'],
  'dashboard-site-engineer': ['Site Engineer'],
  'dashboard-contractor': ['Contractor'],
  'dashboard-client': ['Client'],
};

// Maps each role to its dashboard route — used right after login to send
// someone to the correct dashboard automatically instead of a generic one.
export const DASHBOARD_ROUTE_BY_ROLE: Record<RoleName, string> = {
  Administrator: '/dashboard/admin',
  'Project Manager': '/dashboard/pm',
  'Site Engineer': '/dashboard/site-engineer',
  Contractor: '/dashboard/contractor',
  Worker: '/dashboard/site-engineer',
  Client: '/dashboard/client',
};
