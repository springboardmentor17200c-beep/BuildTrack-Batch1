export interface Company {
  company_id: number;

  company_name: string;
  company_code: string;

  company_email: string;
  company_phone: string;

  address: string;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface CreateCompanyRequest {
  company_name: string;
  company_email: string;
  company_phone: string;
  address: string;

  admin_name: string;
  admin_email: string;
  admin_phone: string;

  password: string;
}

export interface UpdateCompanyRequest {
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  address?: string;
  is_active?: boolean;
}

export interface CompanySummary {
  company_id: number;
  company_name: string;
  company_code: string;
}
