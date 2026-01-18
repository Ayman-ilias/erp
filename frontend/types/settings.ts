// Company interfaces
export interface Company {
  id: number;
  company_name: string;
  legal_name: string | null;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  tax_id: string | null;
  registration_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreate {
  company_name: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  registration_number?: string;
  is_active?: boolean;
}

export interface CompanyUpdate {
  company_name?: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  registration_number?: string;
  is_active?: boolean;
}

// Branch interfaces
export interface Branch {
  id: number;
  branch_code: string;
  branch_name: string;
  branch_type: string | null;
  is_head_office: boolean;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  is_active: boolean;
  company_id: number | null;
  company_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BranchCreate {
  branch_code: string;
  branch_name: string;
  branch_type?: string;
  is_head_office?: boolean;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  is_active?: boolean;
  company_id?: number | null;
}

export interface BranchUpdate {
  branch_code?: string;
  branch_name?: string;
  branch_type?: string;
  is_head_office?: boolean;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  is_active?: boolean;
  company_id?: number | null;
}

// Country interfaces
export interface Country {
  id: number;
  country_name: string;
  iso_code_2: string;
  iso_code_3: string;
  phone_code: string | null;
  currency_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CountryCreate {
  country_name: string;
  iso_code_2: string;
  iso_code_3: string;
  phone_code?: string;
  currency_code?: string;
  is_active?: boolean;
}

export interface CountryUpdate {
  country_name?: string;
  iso_code_2?: string;
  iso_code_3?: string;
  phone_code?: string;
  currency_code?: string;
  is_active?: boolean;
}

// Port interfaces
export interface Port {
  id: number;
  port_name: string;
  port_code: string;
  country_id: number;
  country_name?: string;
  city: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortCreate {
  port_name: string;
  port_code: string;
  country_id: number;
  city?: string;
  is_active?: boolean;
}

export interface PortUpdate {
  port_name?: string;
  port_code?: string;
  country_id?: number;
  city?: string;
  is_active?: boolean;
}
