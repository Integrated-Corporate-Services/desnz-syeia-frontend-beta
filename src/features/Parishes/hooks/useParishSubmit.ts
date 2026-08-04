import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Parish } from "../types/Parish";
import { parishApiService } from "../services/parishApiService";
import { PARISH_VALIDATION } from "../constants/parishConstants";
import { createLogger } from "../../../utils/logger";
import { getNextPageUrl, TASK_NAMES } from "../../../utils/taskListUtils";

const logger = createLogger('useParishSubmit');

export const useParishSubmit = (applicationId: string) => {
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (parishes: Parish[]) => {
      // Validation: At least one parish must be added
      if (parishes.length < PARISH_VALIDATION.MIN_REQUIRED) {
        setValidationError(PARISH_VALIDATION.ERROR_MESSAGE);
        window.scrollTo({ top: 0 });
        return;
      }

      setValidationError(null);
      setIsSubmitting(true);

      try {
        await parishApiService.saveParishes(applicationId, parishes);
        logger.info("Parishes saved successfully");
        // Navigate to the next page in the task list sequence
        const nextPageUrl = getNextPageUrl(TASK_NAMES.PARISHES, applicationId);
        navigate(nextPageUrl);
      } catch (_error) {
        setValidationError("Failed to save parishes. Please try again.");
        window.scrollTo({ top: 0 });
      } finally {
        setIsSubmitting(false);
      }
    },
    [applicationId, navigate]
  );

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  return {
    validationError,
    isSubmitting,
    handleSubmit,
    clearValidationError,
  };
};
