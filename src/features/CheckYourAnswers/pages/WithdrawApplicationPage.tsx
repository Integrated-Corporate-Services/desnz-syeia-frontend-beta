import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";
import { useApplicationFormatters } from "../hooks/useApplicationFormatters";
import TextArea from "../../ProjectOverview/component/TextArea";
import { CONTENT } from "../../../constants/content";

interface WithdrawalLocationState {
  desnzRef?: string;
  formType?: string;
}

const WithdrawApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { formatCaseType } = useApplicationFormatters();
  
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [voluntaryAgreement, setVoluntaryAgreement] = useState<string | null>(null);
  const [withdrawalReason, setWithdrawalReason] = useState<string>("");
  
  // Get application data from location state or use defaults
  const locationState = location.state as WithdrawalLocationState | null;
  const desnzRef = locationState?.desnzRef || "S3700245";
  const formType = locationState?.formType || "S37";
  
  const maxCharacters = CONTENT.MAX_DESCRIPTION_LENGTH;
  const remainingChars = Math.max(0, maxCharacters - withdrawalReason.length);
  
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

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    if (voluntaryAgreement === null) {
      errors.voluntaryAgreement = "Select yes if you have reached a voluntary agreement with the landowner or occupier";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("There is a problem");
      window.scrollTo(0, 0);
      return;
    }

    if (!applicationId) {
      setError("Application ID is missing");
      return;
    }

    // Clear errors
    setError(null);
    setValidationErrors({});

    // Navigate directly to withdrawal confirmation page with application data
    navigate(`${S37_BASE_URL}/${applicationId}/withdrawal-confirmation`, {
      state: {
        desnzRef,
        formType,
        voluntaryAgreement: voluntaryAgreement === "yes",
        withdrawalReason
      }
    });
  };

  return (
    <div className="govuk-width-container">
      <Link to={`${S37_BASE_URL}/${applicationId}/application-summary`} className="govuk-back-link">
        Back
      </Link>
      <main className="govuk-main-wrapper" id="main-content">
        {error && Object.keys(validationErrors).length > 0 && (
          <div
            className="govuk-error-summary"
            aria-labelledby="error-summary-title"
            role="alert"
            data-module="govuk-error-summary"
          >
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                {validationErrors.voluntaryAgreement && (
                  <li>
                    <a href="#voluntary-agreement">{validationErrors.voluntaryAgreement}</a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {error && Object.keys(validationErrors).length === 0 && (
          <div
            className="govuk-error-summary"
            aria-labelledby="error-summary-title"
            role="alert"
            data-module="govuk-error-summary"
          >
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li>{error}</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">
              {desnzRef}: {formatCaseType(formType)}
            </span>
            <h1 className="govuk-heading-xl">
              Withdraw your application
            </h1>

            <div className="govuk-inset-text">
              Your request will be sent to your case officer and your application's status will not change until they have made a decision.
            </div>

            <form onSubmit={handleWithdraw}>
              <div className={`govuk-form-group${validationErrors.voluntaryAgreement ? " govuk-form-group--error" : ""}`}>
                <fieldset className="govuk-fieldset" id="voluntary-agreement">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading">
                      Have you reached a voluntary agreement with the landowner or occupier?
                    </h2>
                  </legend>
                  {validationErrors.voluntaryAgreement && (
                    <p id="voluntary-agreement-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {validationErrors.voluntaryAgreement}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="voluntary-agreement-yes"
                        name="voluntary-agreement"
                        type="radio"
                        value="yes"
                        checked={voluntaryAgreement === "yes"}
                        onChange={(e) => setVoluntaryAgreement(e.target.value)}
                        aria-describedby={validationErrors.voluntaryAgreement ? "voluntary-agreement-error" : undefined}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="voluntary-agreement-yes">
                        Yes
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="voluntary-agreement-no"
                        name="voluntary-agreement"
                        type="radio"
                        value="no"
                        checked={voluntaryAgreement === "no"}
                        onChange={(e) => setVoluntaryAgreement(e.target.value)}
                        aria-describedby={validationErrors.voluntaryAgreement ? "voluntary-agreement-error" : undefined}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="voluntary-agreement-no">
                        No
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className="govuk-form-group govuk-character-count govuk-!-width-two-thirds" style={{ marginTop: "30px" }} data-module="govuk-character-count" data-maxlength={maxCharacters}>
                <TextArea
                  label="Reason for withdrawal (optional)"
                  id="withdrawal-reason"
                  name="withdrawal-reason"
                  value={withdrawalReason}
                  maxLength={maxCharacters}
                  hint="You can provide a reason for your withdrawal request to help your case officer make their decision."
                  infoId="withdrawal-reason-info"
                  remainingChars={remainingChars}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= maxCharacters) {
                      setWithdrawalReason(val);
                    } else {
                      setWithdrawalReason(val.slice(0, maxCharacters));
                    }
                  }}
                />
              </div>

              <div className="govuk-warning-text" style={{ marginTop: "30px", marginBottom: "30px" }}>
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-visually-hidden">Warning</span>
                  You cannot undo this request after you submit it.
                </strong>
              </div>

              <button
                type="submit"
                className="govuk-button govuk-button--warning"
                data-module="govuk-button"
              >
                Submit withdrawal request
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WithdrawApplicationPage;
