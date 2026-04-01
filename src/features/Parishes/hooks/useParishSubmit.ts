import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Parish } from "../types/Parish";
import { parishApiService } from "../services/parishApiService";
import { PARISH_VALIDATION } from "../constants/parishConstants";
import { S37_BASE_URL } from "../../../constants/s37";
import { createLogger } from "../../../utils/logger";

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
        navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
      } catch (error) {
        console.error("Error saving parishes:", error);
        setValidationError("Failed to save parishes. Please try again.");
        window.scrollTo({ top: 0 });
      } finally {
        setIsSubmitting(false);
      }
    },
    [applicationId, navigate]
  );

  return {
    validationError,
    isSubmitting,
    handleSubmit,
  };
};
