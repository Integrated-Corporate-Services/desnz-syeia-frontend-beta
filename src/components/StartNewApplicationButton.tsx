import React from 'react';
import { useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../constants/s37';
import { useApplicationStore } from '../store/useApplicationStore';
import { useAuthUserContext } from '../context/AuthUserContext';
import type { AuthUser } from '../types/auth';

const StartNewApplicationButton: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthUserContext();
  const startApplication = useApplicationStore(state => state.startApplication);

  const handleStart = async () => {
    const created_by = (user as AuthUser)?.person_id || (user as AuthUser)?.user_id || '';
    const newAppData = {
      type: 'S37',
      operator_ref: '',
      status: 'Draft',
      created_by,
    };
    const app = await startApplication(newAppData);
    if (app && app.application_id) {
      navigate(`${S37_BASE_URL}/${app.application_id}/network-operator-details`);
    }
  };

  return (
    <a
      href="#"
      className="govuk-button"
      onClick={async e => {
        e.preventDefault();
        await handleStart();
      }}
    >
      Start new application
    </a>
  );
};

export default StartNewApplicationButton;