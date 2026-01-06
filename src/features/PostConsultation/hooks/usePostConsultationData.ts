import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import {
  saveConsultationOutcome,
  getConsultationOutcome,
} from "../../../services/consultationOutcomeService";
import { ConsultationOutcomeFormData, SaveType } from "../types";
import { mapApiToFormData, mapFormDataToApi } from "../utils/mappers";
import { POST_CONSULTATION_CONSTANTS } from "../constants";

export const usePostConsultationData = (applicationId: string | undefined) => {
  const [lpaModifications, setLpaModifications] = useState<string>("");
  const [acceptConditions, setAcceptConditions] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Load existing data on mount
  useEffect(() => {
    const loadExistingData = async () => {
      if (!applicationId) {
        setLoading(false);
        return;
      }

      try {
        const outcome = await getConsultationOutcome(applicationId);
        const formData = mapApiToFormData(outcome);

        if (formData.lpaModifications)
          setLpaModifications(formData.lpaModifications);
        if (formData.acceptConditions)
          setAcceptConditions(formData.acceptConditions);
        if (formData.explanation) setExplanation(formData.explanation);
      } catch (err) {
        const error = err as AxiosError<{ error?: string }>;
        console.error("Error loading consultation outcome:", error);
        setError(POST_CONSULTATION_CONSTANTS.ERROR_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };

    loadExistingData();
  }, [applicationId]);

  const saveData = async (saveType: SaveType): Promise<boolean> => {
    if (!applicationId) {
      setError(POST_CONSULTATION_CONSTANTS.ERROR_MISSING_APP_ID);
      return false;
    }

    setError("");
    setSaving(true);

    try {
      const formData: ConsultationOutcomeFormData = {
        lpaModifications,
        acceptConditions,
        explanation,
      };

      const apiData = mapFormDataToApi(formData);
      await saveConsultationOutcome(applicationId, apiData);

      if (saveType === "later") {
        alert(POST_CONSULTATION_CONSTANTS.SAVE_SUCCESS_MESSAGE);
      }

      return true;
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      console.error("Error saving consultation outcome:", error);
      const errorMessage =
        error.response?.data?.error ||
        POST_CONSULTATION_CONSTANTS.ERROR_SAVE_FAILED;
      setError(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    lpaModifications,
    setLpaModifications,
    acceptConditions,
    setAcceptConditions,
    explanation,
    setExplanation,
    loading,
    saving,
    error,
    saveData,
  };
};
