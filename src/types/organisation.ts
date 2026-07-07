// Organisation and related types

export interface Organisation {
  organisation_id: string;
  organisation_name: string;
  organisation_type?: string;
  team_coordinators: string[];
  approved_domains: string[];
  address_line1?: string;
  address_line2?: string;
  town_city?: string;
  postcode?: string;
  county?: string;
}

export interface TeamCoordinator {
  user_id: string;
  person_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  address_id: string | null;
  address_line1: string | null;
  address_line2: string | null;
  town_city: string | null;
  postcode: string | null;
  organisation_id: string;
  organisation_name: string;
  role: string;
  status: string;
}

export interface UpdateTeamCoordinatorData {
  email?: string;
  phone_number?: string;
  location?: string;
  address_id?: string;
}

export interface ApprovedDomainsResponse {
  approved_domains: string[];
}

export interface Domain {
  id: string;
  domain: string;
}
