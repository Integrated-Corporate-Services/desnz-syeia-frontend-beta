export type Application = {
  application_id: string;
  type: string;
  operator_ref: string;
  project_name: string;
  project_desc: string;
  status: string;
  created_by: string;
  created_at: string;
  submitted_at: string;
  application_parties?: ApplicationParty[]; // Optional field for merged backend response
};


export type ApplicationParty = {
  party_type: string;
  organisation_name: string;
  line1: string;
  line2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
  organisation_id?: string;
  person_id?: string;
  contact_id?: string;
  is_primary: boolean;
};
