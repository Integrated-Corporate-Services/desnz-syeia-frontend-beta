export interface Address {
  address_line_1?: string;
  address_line_2?: string;
  locality?: string;
  region?: string;
  postal_code?: string;
  country?: string;
}

export type CompanyStatus =
  | "active"
  | "dissolved"
  | "liquidation"
  | "receivership"
  | "administration"
  | "voluntary-arrangement"
  | "converted-closed"
  | "insolvency-proceedings";

export interface CompanySearchResult {
  title: string;
  company_number: string;
  company_status: string;
  address_snippet?: string;
  company_type?: string;
  date_of_creation?: string;
  description?: string;
  kind?: string;
  links?: {
    self: string;
  };
}

export interface CompanyDetails {
  company_name: string;
  company_number: string;
  company_status: string;
  date_of_creation?: string;
  type: string;
  registered_office_address?: Address;
  sic_codes?: string[];
}

export interface CompanySearchResponse {
  items: CompanySearchResult[];
  total_results?: number;
  kind?: string;
  page_number?: number;
}
