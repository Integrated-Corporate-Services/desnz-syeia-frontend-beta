import React, { useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";
import { NWL_BASE_URL } from "../../../constants/nwl";
import { TLP_BASE_URL } from "../../../constants/tlp";
import { WITHDRAWAL_LABELS } from "../constants/applicationSummaryLabels";

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
  const formType = locationState?.formType || "S37";
  
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

  // Helper function to get base URL based on application type
  const getBaseUrl = () => {
    const type = formType.toUpperCase();
    if (type === 'NWL') return NWL_BASE_URL;
    if (type === 'TLP' || type === 'TL') return TLP_BASE_URL;
    return S37_BASE_URL;
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
            <div className="govuk-width-container">
              <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">
                {WITHDRAWAL_LABELS.CONFIRMATION_TITLE}
              </h1>
              <div className="govuk-panel__body">
                Application {desnzRef}
              </div>
            </div>

            <h2 className="govuk-heading-m">{WITHDRAWAL_LABELS.WHAT_HAPPENS_NEXT}</h2>

            <p className="govuk-body">
              {WITHDRAWAL_LABELS.CONFIRMATION_MESSAGE_1}
            </p>

            <p className="govuk-body">
              {WITHDRAWAL_LABELS.CONFIRMATION_MESSAGE_2}
            </p>

            <p className="govuk-body">
              {WITHDRAWAL_LABELS.CONFIRMATION_MESSAGE_3}
            </p>

            <div className="govuk-inset-text">
              {WITHDRAWAL_LABELS.MISTAKE_MESSAGE} <a href="mailto:S37consents@energysecurity.gov.uk" className="govuk-link">S37consents@energysecurity.gov.uk</a> as soon as possible.
            </div>

            <p className="govuk-body">
              <Link to={`${getBaseUrl()}/${applicationId}/application-summary`} className="govuk-link">
                {WITHDRAWAL_LABELS.RETURN_TO_SUMMARY}
              </Link>
            </p>

            <p className="govuk-body">
              <Link to="/application-dashboard" className="govuk-link">
                {WITHDRAWAL_LABELS.GO_TO_DASHBOARD}
              </Link>
            </p>
          </div>
        </div>
          </div>
    </>
  );
};

export default WithdrawalConfirmationPage;
