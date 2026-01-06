import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { applicationApiService } from "../../../services/applicationApiService";
import { S37_BASE_URL } from "../../../constants/s37";

export const useDeclarationSubmit = (applicationId: string) => {
  const navigate = useNavigate();
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("[useDeclarationSubmit] Hook initialized", { applicationId });

  const handleDeclarationChange = (isChecked: boolean) => {
    setDeclarationConfirmed(isChecked);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!declarationConfirmed) return;

    setIsSubmitting(true);
    setError(null);

    if (!applicationId) {
      console.error("Cannot save declaration: applicationId is missing");
      setError("Application ID is missing");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Saving declaration confirmation:", {
        applicationId,
        declarationConfirmed: true,
      });
      await applicationApiService.confirmDeclaration(applicationId, true);
      console.log("Declaration saved successfully");

      await applicationApiService.submitApplication(applicationId);
      navigate(`${S37_BASE_URL}/${applicationId}/confirmation`);
    } catch (_err) {
      console.error("Failed to submit application:", _err);
      setError("Failed to submit application. Please try again.");
      setIsSubmitting(false);
    }
  };

  return {
    declarationConfirmed,
    isSubmitting,
    error,
    handleDeclarationChange,
    handleSubmit,
  };
};
