import React from 'react';
import { useNavigate } from 'react-router-dom';

type StartNewApplicationButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

const StartNewApplicationButton: React.FC<StartNewApplicationButtonProps> = ({ onClick }) => {
  const navigate = useNavigate();
  return (
    <a
      href="#"
      className="govuk-button"
      onClick={e => {
        e.preventDefault();
        if (onClick) {
          onClick(e);
        } else {
          navigate('/choose-application');
        }
      }}
    >
      Start new application
    </a>
  );
};

export default StartNewApplicationButton;


