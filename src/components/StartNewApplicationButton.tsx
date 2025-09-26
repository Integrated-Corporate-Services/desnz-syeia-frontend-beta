import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const StartNewApplicationButton: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(ROUTES.NETWORK_OPERATOR_DETAILS);
  };

  return (
    <a
      href="#"
      className="govuk-button"
      onClick={e => {
        e.preventDefault();
        handleStart();
      }}
    >
      Start new application
    </a>
  );
};

export default StartNewApplicationButton;