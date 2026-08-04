import { useNavigate } from "react-router-dom";
import { applicationApiService } from "../../../services/applicationApiService";
import { Application, ApplicationParty } from "../../../types/application";
import { ERROR_MESSAGES } from "../constants/contactDetailsConstants";
import { getNextPageUrl, TASK_NAMES } from "../../../utils/taskListUtils";

interface UseContactDetailsSubmitProps {
  application: Application | null;
  party?: ApplicationParty;
  appId: string;
  contactIsConfirmed: true | false | null;
  setError: (error: string) => void;
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
}: UseContactDetailsSubmitProps) {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (contactIsConfirmed === null) {
      setError(ERROR_MESSAGES.CONFIRMATION_REQUIRED);
      return;
    }

    setError("");

    try {
      if (application && application.application_id) {
        // Confirm contact details - updates contact_isconfirmed and progress
        await applicationApiService.confirmContactDetails(
          application.application_id,
          contactIsConfirmed
        );
      }

      // Navigate to the next page in the task list sequence
      const nextPageUrl = getNextPageUrl(TASK_NAMES.CHECK_APPLICANT_CONTACT_DETAILS, appId);
      navigate(nextPageUrl);
    } catch (error) {
      const err = error as Error;
      setError(err.message || ERROR_MESSAGES.SAVE_FAILED);
    }
  };

  return { handleSubmit };
}
