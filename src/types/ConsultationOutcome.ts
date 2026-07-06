/**
 * Type definitions for Consultation Outcome
 */

export interface ConsultationOutcomeData {
    lpa_conditions_imposed?: boolean | null;
    lpa_conditions_accepted?: boolean | null;
    lpa_conditions_not_accepted_reason?: string | null;
    consultees_recommendations_made?: boolean | null;
    consultees_recommendations_accepted?: boolean | null;
    consultees_recommendations_not_accepted_reason?: string | null;
    version?: number;
}

export interface ConsultationOutcomeResponse {
    id: string;
    application_id: string;
    lpa_conditions_imposed: boolean | null;
    lpa_conditions_accepted: boolean | null;
    lpa_conditions_not_accepted_reason: string | null;
    consultees_recommendations_made: boolean | null;
    consultees_recommendations_accepted: boolean | null;
    consultees_recommendations_not_accepted_reason: string | null;
    created_at: string;
    created_by: string;
    last_updated_at: string | null;
    last_updated_by: string | null;
    version?: number;
}

export interface ConsultationOutcomeStatusResponse {
    application_id: string;
    is_complete: boolean;
}
