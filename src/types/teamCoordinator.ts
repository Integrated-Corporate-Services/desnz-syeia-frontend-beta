/**
 * Team Coordinator type definitions
 */

export interface TeamCoordinator {
  user_id: string;
  person_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  line1?: string;
  line2?: string;
  town_city?: string;
  county?: string;
  postcode?: string;
  role: string;
  status: string;
  organisation_id: string;
}

export interface TeamCoordinatorOption {
  organisation_id: string;
  organisation_name: string;
  person_id: string;
  contact_id: string;
  person_name: string;
  line1: string;
  line2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  email?: string;
  phone?: string;
  party_type: string;
  is_primary: boolean;
  contact_isconfirmed: boolean;
}
