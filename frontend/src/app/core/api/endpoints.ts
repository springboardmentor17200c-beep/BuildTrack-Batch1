export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    COMPANY_REGISTER: '/auth/company/register',
    EMPLOYEE_REGISTER: '/auth/employee/register',
    REQUEST_OTP: '/auth/request-otp',
    VERIFY_OTP: '/auth/verify-otp',
    RESET_PASSWORD: '/auth/reset-password',
  },

  USERS: {
    BASE: '/users',
    ME: '/users/me',
    CHANGE_PASSWORD: '/users/change-password',
    DETAILS: (id: number | string) => `/users/${id}`,
  },

  COMPANIES: {
    BASE: '/companies',
    DETAILS: (id: number | string) => `/companies/${id}`,
  },

  LOOKUPS: {
    BASE: '/lookups',
  },

  PROJECTS: {
    BASE: '/projects',
    DETAILS: (id: number | string) => `/projects/${id}`,
  },

  MILESTONES: {
    BASE: '/milestones',
    DETAILS: (id: number | string) => `/milestones/${id}`,
    BY_PROJECT: (projectId: number | string) => `/milestones?project_id=${projectId}`,
  },
} as const;
