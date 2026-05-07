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
