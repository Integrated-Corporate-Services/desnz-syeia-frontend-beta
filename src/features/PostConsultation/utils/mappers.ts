import {
  ConsultationOutcomeFormData,
  ConsultationOutcomeApiData,
  ConsultationOutcomeResponse,
} from "../types";

/**
 * Maps backend API response to UI form data
 */
export const mapApiToFormData = (
  outcome: ConsultationOutcomeResponse | null
): Partial<ConsultationOutcomeFormData> => {
  if (!outcome) {
    return {};
  }

  const formData: Partial<ConsultationOutcomeFormData> = {};

  if (
    outcome.lpa_conditions_imposed !== null &&
    outcome.lpa_conditions_imposed !== undefined
  ) {
    formData.lpaModifications = outcome.lpa_conditions_imposed ? "yes" : "no";
  }

  if (
    outcome.lpa_conditions_accepted !== null &&
    outcome.lpa_conditions_accepted !== undefined
  ) {
    formData.acceptConditions = outcome.lpa_conditions_accepted ? "yes" : "no";
  }

  if (outcome.lpa_conditions_not_accepted_reason) {
    formData.explanation = outcome.lpa_conditions_not_accepted_reason;
  }

  return formData;
};

/**
 * Maps UI form data to backend API format
 */
export const mapFormDataToApi = (
  formData: ConsultationOutcomeFormData
): ConsultationOutcomeApiData => {
  return {
    lpa_conditions_imposed: formData.lpaModifications === "yes",
    lpa_conditions_accepted:
      formData.lpaModifications === "yes"
        ? formData.acceptConditions === "yes"
        : undefined,
    lpa_conditions_not_accepted_reason:
      formData.lpaModifications === "yes" && formData.acceptConditions === "no"
        ? formData.explanation
        : null,
  };
};
