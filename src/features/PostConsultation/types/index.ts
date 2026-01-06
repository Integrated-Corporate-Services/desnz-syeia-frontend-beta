export interface ConsultationOutcomeFormData {
  lpaModifications: string;
  acceptConditions: string;
  explanation: string;
}

export interface ConsultationOutcomeApiData {
  lpa_conditions_imposed?: boolean;
  lpa_conditions_accepted?: boolean;
  lpa_conditions_not_accepted_reason?: string | null;
}

export interface ConsultationOutcomeResponse {
  id: string;
  application_id: string;
  lpa_conditions_imposed: boolean | null;
  lpa_conditions_accepted: boolean | null;
  lpa_conditions_not_accepted_reason: string | null;
  created_at: string;
  created_by: string;
  last_updated_at: string | null;
  last_updated_by: string | null;
}

export type SaveType = "continue" | "later";
