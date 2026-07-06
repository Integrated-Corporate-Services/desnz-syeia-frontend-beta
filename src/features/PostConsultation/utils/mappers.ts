import { ConsultationOutcomeFormData, ConsultationOutcomeApiData, ConsultationOutcomeResponse } from '../types';

/**
 * Maps backend API response to UI form data
 * Note: Version is not included in form data - it's managed separately in the hook state
 */
export const mapApiToFormData = (outcome: ConsultationOutcomeResponse | null): Partial<ConsultationOutcomeFormData> => {
    if (!outcome) {
        return {};
    }

    const formData: Partial<ConsultationOutcomeFormData> = {};

    if (outcome.lpa_conditions_imposed !== null && outcome.lpa_conditions_imposed !== undefined) {
        formData.lpaModifications = outcome.lpa_conditions_imposed ? 'yes' : 'no';
    }

    if (outcome.lpa_conditions_accepted !== null && outcome.lpa_conditions_accepted !== undefined) {
        formData.acceptConditions = outcome.lpa_conditions_accepted ? 'yes' : 'no';
    }

    if (outcome.lpa_conditions_not_accepted_reason) {
        formData.explanation = outcome.lpa_conditions_not_accepted_reason;
    }

    if (outcome.consultees_recommendations_made !== null && outcome.consultees_recommendations_made !== undefined) {
        formData.consulteesRecommendations = outcome.consultees_recommendations_made ? 'yes' : 'no';
    }

    if (outcome.consultees_recommendations_accepted !== null && outcome.consultees_recommendations_accepted !== undefined) {
        formData.acceptConsulteesRecommendations = outcome.consultees_recommendations_accepted ? 'yes' : 'no';
    }

    if (outcome.consultees_recommendations_not_accepted_reason) {
        formData.consulteesExplanation = outcome.consultees_recommendations_not_accepted_reason;
    }

    return formData;
};

/**
 * Maps UI form data to backend API format
 * Only includes fields with actual values (sparse update pattern)
 * Explicitly sends null to clear dependent fields when parent changes
 * Note: Version is added separately in usePostConsultationData hook after mapping
 */
export const mapFormDataToApi = (formData: ConsultationOutcomeFormData): ConsultationOutcomeApiData => {
    const apiData: Partial<ConsultationOutcomeApiData> = {};

    // LPA Flow: Always send all LPA fields that have been touched to maintain consistency
    if (formData.lpaModifications !== undefined && formData.lpaModifications !== '') {
        apiData.lpa_conditions_imposed = formData.lpaModifications === 'yes';

        if (formData.lpaModifications === 'yes') {
            // If modifications were imposed, check if acceptance has been answered
            if (formData.acceptConditions !== undefined && formData.acceptConditions !== '') {
                apiData.lpa_conditions_accepted = formData.acceptConditions === 'yes';

                if (formData.acceptConditions === 'no') {
                    // User rejected conditions - send reason (or null if not entered yet)
                    apiData.lpa_conditions_not_accepted_reason = formData.explanation || null;
                } else {
                    // User accepted conditions - explicitly clear reason
                    apiData.lpa_conditions_not_accepted_reason = null;
                }
            }
        } else {
            // No modifications imposed - explicitly clear dependent fields
            apiData.lpa_conditions_accepted = null;
            apiData.lpa_conditions_not_accepted_reason = null;
        }
    }

    // Consultees Flow: Always send all consultees fields that have been touched
    if (formData.consulteesRecommendations !== undefined && formData.consulteesRecommendations !== '') {
        apiData.consultees_recommendations_made = formData.consulteesRecommendations === 'yes';

        if (formData.consulteesRecommendations === 'yes') {
            // If recommendations were made, check if acceptance has been answered
            if (formData.acceptConsulteesRecommendations !== undefined && formData.acceptConsulteesRecommendations !== '') {
                apiData.consultees_recommendations_accepted = formData.acceptConsulteesRecommendations === 'yes';

                if (formData.acceptConsulteesRecommendations === 'no') {
                    // User rejected recommendations - send reason (or null if not entered yet)
                    apiData.consultees_recommendations_not_accepted_reason = formData.consulteesExplanation || null;
                } else {
                    // User accepted recommendations - explicitly clear reason
                    apiData.consultees_recommendations_not_accepted_reason = null;
                }
            }
        } else {
            // No recommendations made - explicitly clear dependent fields
            apiData.consultees_recommendations_accepted = null;
            apiData.consultees_recommendations_not_accepted_reason = null;
        }
    }

    return apiData as ConsultationOutcomeApiData;
};
