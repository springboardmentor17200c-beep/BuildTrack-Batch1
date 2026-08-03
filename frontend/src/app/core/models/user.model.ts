export interface User {
  user_id: number;

  company_id: number | null;
  role_id: number;

  full_name: string;
  email: string;
  phone_number: string;

  is_active: boolean;

  registration_status: RegistrationStatus;

  approved_by: number | null;
  approved_at: string | null;
  rejected_reason: string | null;

  last_login: string | null;

  created_at: string;
  updated_at: string;
}

export type RegistrationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface CreateUserRequest {
  company_id?: number;

  role_id: number;

  full_name: string;
  email: string;
  phone_number: string;

  password: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  phone_number?: string;
  role_id?: number;

  is_active?: boolean;
}

export interface UserProfile {
  user_id: number;

  full_name: string;
  email: string;
  phone_number: string;

  company_name: string;
  company_code: string;

  role_name: string;
}
