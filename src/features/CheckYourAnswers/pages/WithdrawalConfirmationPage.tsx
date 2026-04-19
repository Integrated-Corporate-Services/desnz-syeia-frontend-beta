import React, { useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";

interface ConfirmationLocationState {
  desnzRef?: string;
  formType?: string;
  voluntaryAgreement?: boolean;
  withdrawalReason?: string;
}

const WithdrawalConfirmationPage: React.FC = () => {
  const params = useParams();
  const location = useLocation();
  
  // Get application data from location state or use defaults
  const locationState = location.state as ConfirmationLocationState | null;
  const desnzRef = locationState?.desnzRef;
  
  const getApplicationId = () => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const idFromQuery =
        searchParams.get("id") || searchParams.get("applicationId");
      if (idFromQuery) return idFromQuery;
    }
    return "";
  };

  const applicationId = getApplicationId();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">
                Withdrawal request submitted
              </h1>
              <div className="govuk-panel__body">
                Application {desnzRef}
              </div>
            </div>

            <h2 className="govuk-heading-m">What happens next</h2>

            <p className="govuk-body">
              Your withdrawal request has been sent to your case officer and you do not need to do anything else.
            </p>

            <p className="govuk-body">
              Your application's status will not change until a decision has been made.
            </p>

            <p className="govuk-body">
              You will receive an email to confirm whether your request has been approved or not.
            </p>

            <div className="govuk-inset-text">
              If you submitted this withdrawal request by mistake, contact <a href="mailto:S37consents@energysecurity.gov.uk" className="govuk-link">S37consents@energysecurity.gov.uk</a> as soon as possible.
            </div>

            <p className="govuk-body">
              <Link to={`${S37_BASE_URL}/${applicationId}/application-summary`} className="govuk-link">
                Return to your application summary
              </Link>
            </p>

            <p className="govuk-body">
              <Link to="/workbasket" className="govuk-link">
                Go to your applications dashboard
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WithdrawalConfirmationPage;
