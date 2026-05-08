import type { ObjectorDetails } from '../features/NWL/ObjectorDetails/types';

export type ApplicationPermissions = {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSubmit: boolean;
  canDownload: boolean;
  canWithdraw: boolean;
};

export type Application = {
  application_id: string;
  type: string;
  desnz_ref: string;
  operator_ref?: string;
  operator_name?: string;
  your_reference?: string;
  status: string;
  created_by: string;
  created_at: string;
  submitted_at: string;
  application_party?: ApplicationParty | undefined;
  permissions?: ApplicationPermissions;
  objector_details?: ObjectorDetails;
  type_of_use?: string; // NWL: Type of use for the wayleave application
  wayleave_offer_date?: string; // NWL: Date of wayleave offer for new lines
  grounds_for_application?: string; // NWL: Grounds for application (existing lines)
  wayleave_type?: string; // NWL: Type of wayleave that existed
  wayleave_expiry_date?: string; // NWL: Expiry date of the wayleave
  notice_to_remove_date?: string; // NWL: Date of Notice to Remove
  is_notice_to_remove_clear?: boolean; // NWL: Whether the Notice to Remove is clear
  notice_to_remove_unclear_explanation?: string; // NWL: Explanation if notice is unclear
  is_within_three_months?: boolean; // NWL: Whether application is within 3 months
  application_outside_timeframe_explanation?: string; // NWL: Explanation if outside timeframe
  is_standard_term?: boolean; // NWL: Whether applying for standard 15-year term
  standard_term_explanation?: string; // NWL: Explanation if not standard term
  notice_to_terminate_date?: string; // NWL: Date of Notice to Terminate
  termination_period_expired?: boolean; // NWL: Whether termination period has expired
};

export type ApplicationParty = {
  party_type: string;
  organisation_name: string;
  line1: string;
  line2?: string;
  city?: string;
  postcode?: string;
  county?: string;
  email?: string;
  phone?: string;
  organisation_id?: string;
  person_id?: string;
  contact_id?: string;
  contact_person_id?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  contact_person_line1?: string;
  contact_person_line2?: string;
  contact_person_city?: string;
  contact_person_country?: string;
  contact_person_postcode?: string;
  is_primary: boolean | null;
  contact_isconfirmed?: boolean | null;
  person_name?: string;
  additional_contact?: string | null;
};

export interface ApplicationDeletionResult {
  success: boolean;
  applicationId: string;
}
