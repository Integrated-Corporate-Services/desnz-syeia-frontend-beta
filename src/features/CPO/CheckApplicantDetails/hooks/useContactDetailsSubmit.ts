import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from 'react';
import { applicationApiService } from "../../../../services/applicationApiService";
import { Application, ApplicationParty } from "../../../../types/application";
import { ERROR_MESSAGES } from "../constants/contactDetailsConstants";

const CPO_BASE_URL = "/cpo";

interface UseContactDetailsSubmitProps {
  application: Application | null;
  party?: ApplicationParty;
  appId: string;
  contactIsConfirmed: true | false | null;
  setError: (error: string) => void;
}

export function useContactDetailsSubmit({
  application,
  party,
  appId,
  contactIsConfirmed,
  setError,
}: UseContactDetailsSubmitProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const submitting = useRef(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;

    if (contactIsConfirmed === null) {
      setError(ERROR_MESSAGES.CONFIRMATION_REQUIRED);
      return;
    }

    setError("");

    if (!application?.application_id) {
      setError('Unable to load the application. Try again.');
      return;
    }
    submitting.current = true;
    setSaving(true);
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
      });

      navigate(`${CPO_BASE_URL}/${appId}/${new URLSearchParams(location.search).get('from') === 'application-review' ? 'check-and-submit' : 'task-list'}`);
    } catch {
      setError('Unable to save the applicant details. Try again.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return { handleSubmit, saving };
}
