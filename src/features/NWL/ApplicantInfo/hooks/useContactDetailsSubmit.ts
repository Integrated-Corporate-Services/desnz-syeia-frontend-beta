import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { Application, ApplicationParty } from "../../../../types/application";
import { ERROR_MESSAGES } from "../constants/contactDetailsConstants";

const NWL_BASE_URL = "/nwl";

interface UseContactDetailsSubmitProps {
  application: Application | null;
  party?: ApplicationParty;
  appId: string;
  contactIsConfirmed: true | false | null;
  setError: (error: string) => void;
}

/**
 * Custom hook to handle contact details form submission
 * Saves team coordinator contact confirmation and navigates to task list
 */
export function useContactDetailsSubmit({
  application,
  party,
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

    if (application && application.application_id) {
      // Save the team coordinator's contact confirmation
      // party.organisation_id = DNO (e.g., National Grid)
      // party.contact_person_id = Team Coordinator (selected in previous step)
      await useApplicationStore.getState().saveNetworkOperator({
        application_id: application.application_id,
        operator_ref: application.operator_ref,
        organisation_id: party?.organisation_id,
        person_id: party?.contact_person_id, // Team coordinator ID, not agent
        contact_id: party?.contact_id,
        role: "APPLICANT",
        is_primary: true,
        contact_isconfirmed: contactIsConfirmed,
        type: application?.type,
        additional_contact: party?.additional_contact || null,
      });
    }

    navigate(`${NWL_BASE_URL}/${appId}/task-list`);
  };

  return { handleSubmit };
}
