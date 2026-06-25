import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

type ErrorState = {
  errorCode?: string;
  errorMessage?: string;
  consentFee?: number;
  screeningFee?: number;
  eiaFee?: number;
  totalAmount?: number;
  breakdown?: unknown;
};

const InvoiceGenerationErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const baseUrl = location.pathname.includes('/nwl/') ? NWL_BASE_URL : S37_BASE_URL;
  const errorState = (location.state || {}) as ErrorState;

  const handleReturnToApplication = () => {
    navigate(`${baseUrl}/${applicationId}/task-list`, {
      state: errorState,
      replace: true,
    });
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <h1 className="govuk-heading-xl">Sorry, there is a problem with the service</h1>
        <p className="govuk-body">You can return to the application and try again.</p>

        <div className="govuk-button-group">
          <button className="govuk-button govuk-button--secondary" onClick={handleReturnToApplication}>
            Return to application
          </button>
        </div>
      </main>
    </div>
  );
};

export default InvoiceGenerationErrorPage;
