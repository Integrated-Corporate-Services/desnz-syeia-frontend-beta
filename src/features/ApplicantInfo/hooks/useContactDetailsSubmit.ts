import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { applicationApiService } from "../../../services/applicationApiService";
import { Application } from "../../../types/application";
import { ERROR_MESSAGES } from "../constants/contactDetailsConstants";
import { ERROR_MESSAGES as GLOBAL_ERROR_MESSAGES } from "../../../constants/error";
import { getNextPageUrl, TASK_NAMES } from "../../../utils/taskListUtils";

type ContactConfirmationError = {
  isVersionConflict?: boolean;
  statusCode?: number;
  message?: string;
};

interface UseContactDetailsSubmitProps {
  application: Application | null;
  appId: string;
  contactIsConfirmed: true | false | null;
  setError: (error: string) => void;
  version: number;
  setVersion: (version: number) => void;
  setVersionError: (error: string) => void;
}

/**
 * Custom hook to handle contact details confirmation submission
 * Confirms contact details and updates progress accordingly
 */
export function useContactDetailsSubmit({
  application,
  appId,
  contactIsConfirmed,
  setError,
  version,
  setVersion,
  setVersionError,
}: UseContactDetailsSubmitProps) {
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard against duplicate submissions which can trigger false conflicts.
    if (isSubmittingRef.current) {
      return;
    }

    if (contactIsConfirmed === null) {
      setError(ERROR_MESSAGES.CONFIRMATION_REQUIRED);
      return;
    }

    setError("");
    isSubmittingRef.current = true;

    try {
      if (application && application.application_id) {
        // Confirm contact details - updates contact_isconfirmed and progress
        const result = await applicationApiService.confirmContactDetails(
          application.application_id,
          contactIsConfirmed,
          version  // Pass version for optimistic locking
        );
        
        // Update version from response
        if (result?.application_party?.version) {
          setVersion(result.application_party.version);
        }
      }

      // Navigate to the next page in the task list sequence
      const nextPageUrl = getNextPageUrl(TASK_NAMES.CHECK_APPLICANT_CONTACT_DETAILS, appId);
      navigate(nextPageUrl);
    } catch (error: unknown) {
      const conflictError = error as ContactConfirmationError;
      // Handle version conflict 
      if (conflictError.isVersionConflict || conflictError.statusCode === 409) {
        //const err = error as Error;
        setVersionError(GLOBAL_ERROR_MESSAGES.VERSION_CONFLICT);
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return { handleSubmit };
}
