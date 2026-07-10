import { useNavigate } from "react-router-dom";
import { applicationApiService } from "../../../../services/applicationApiService";
import { Application, ApplicationParty } from "../../../../types/application";
import { ERROR_MESSAGES } from "../constants/contactDetailsConstants";
import { nwlProgressService } from "../../services/nwlProgressService";
import { ERROR_MESSAGES as GLOBAL_ERROR_MESSAGES } from "../../../../constants/error";

const NWL_BASE_URL = "/nwl";  

type ContactConfirmationError = {
  isVersionConflict?: boolean;
  statusCode?: number;
  message?: string;
};

interface UseContactDetailsSubmitProps {
  application: Application | null;
  party?: ApplicationParty;
  appId: string;
  contactIsConfirmed: true | false | null;
  setError: (error: string) => void;
  setVersionError: (error: string) => void;
}

export function useContactDetailsSubmit({
  application,
  party,
  appId,
  contactIsConfirmed,
  setError,
  setVersionError,
}: UseContactDetailsSubmitProps) {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (contactIsConfirmed === null) {
      setError(ERROR_MESSAGES.CONFIRMATION_REQUIRED);
      return;
    }

    setError("");

    if (application && application.application_id) {
      try {
      await applicationApiService.saveNetworkOperator({
        application_id: application.application_id,
        operator_ref: application.operator_ref,
        organisation_id: party?.organisation_id,
        person_id: party?.contact_person_id,
        contact_id: party?.contact_id,
        role: "APPLICANT",
        is_primary: true,
        contact_isconfirmed: contactIsConfirmed,
        type: application?.type,
        additional_contact: party?.additional_contact || null,
        version: party?.version || 1, // Use the current version or default to 1
      });

      const status = contactIsConfirmed ? 'Completed' : 'Not completed';
      await nwlProgressService.updateProgress(
        application.application_id,
        'Check applicant contact details',
        status
      );
      } catch (error: unknown) {
            const conflictError = error as ContactConfirmationError;
            // Handle version conflict 
            if (conflictError.isVersionConflict || conflictError.statusCode === 409) {
              //const err = error as Error;
              setVersionError(GLOBAL_ERROR_MESSAGES.VERSION_CONFLICT);
              // Scroll to top to show error message
              window.scrollTo({ top: 0, behavior: 'smooth' });
              throw error; // Re-throw to prevent navigation
            }

          }
    }

    navigate(`${NWL_BASE_URL}/${appId}/task-list`);
  };

  return { handleSubmit };
}
