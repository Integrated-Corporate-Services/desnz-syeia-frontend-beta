/**
 * Application Delete Success Page
 * 
 * Separate page for application deletion success confirmation
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ApplicationDeleteSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    navigate('/application-dashboard');
  };

  return (
    <div className="govuk-width-container">
      <div className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">Application deleted</h1>
              <div className="govuk-panel__body">
                Your application has been deleted.
              </div>
            </div>
            
            <p className="govuk-body">
              <a 
                href="#" 
                className="govuk-link" 
                onClick={(e) => {
                  e.preventDefault();
                  handleReturnToDashboard();
                }}
              >
                Return to dashboard
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};