import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";
import { useApplicationFormatters } from "../hooks/useApplicationFormatters";
import { CONTENT } from "../../../constants/content";
import { applicationApiService } from "../../../services/applicationApiService";
import { WITHDRAWAL_LABELS, BUTTON_LABELS } from "../constants/applicationSummaryLabels";

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [applicationData, setApplicationData] = useState<{ desnzRef: string; formType: string } | null>(null);
  
  // Get application data from location state or use defaults
  const locationState = location.state as WithdrawalLocationState | null;
  const desnzRef = applicationData?.desnzRef || locationState?.desnzRef || "S3700245";
  const formType = applicationData?.formType || locationState?.formType || "S37";
  
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

  // Fetch application data on mount
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!applicationId) return;
      
      try {
        const data = await applicationApiService.getApplicationById(applicationId);
        setApplicationData({
          desnzRef: data.desnz_ref || "S3700245",
          formType: data.type || "S37",
        });
      } catch (err) {
        console.error("Failed to fetch application data:", err);
        // Use fallback values if fetch fails
        setApplicationData({
          desnzRef: locationState?.desnzRef || "S3700245",
          formType: locationState?.formType || "S37",
        });
      }
    };

    fetchApplicationData();
  }, [applicationId, locationState?.desnzRef, locationState?.formType]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
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

    // Clear errors and set submitting state
    setError(null);
    setValidationErrors({});
    setIsSubmitting(true);

    try {
      // Call the API to submit the withdrawal request
      await applicationApiService.withdrawApplication(
        applicationId,
        voluntaryAgreement === "yes",
        withdrawalReason || undefined
      );

      // Navigate to confirmation page on success
      navigate(`${S37_BASE_URL}/${applicationId}/withdrawal-confirmation`, {
        state: {
          desnzRef,
          formType,
          voluntaryAgreement: voluntaryAgreement === "yes",
          withdrawalReason
        }
      });
    } catch (err: unknown) {
      console.error("Failed to submit withdrawal request:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to submit withdrawal request. Please try again.";
      setError(errorMessage);
      setIsSubmitting(false);
      window.scrollTo(0, 0);
    }
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
              {WITHDRAWAL_LABELS.PAGE_TITLE}
            </h1>

            <div className="govuk-inset-text">
              {WITHDRAWAL_LABELS.INSET_TEXT}
            </div>

            <form onSubmit={handleWithdraw}>
              <div className={`govuk-form-group${validationErrors.voluntaryAgreement ? " govuk-form-group--error" : ""}`}>
                <fieldset className="govuk-fieldset" id="voluntary-agreement">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading">
                      {WITHDRAWAL_LABELS.VOLUNTARY_AGREEMENT_QUESTION}
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

              <div className="govuk-form-group govuk-character-count govuk-!-width-two-thirds withdrawal-reason-spacing" data-module="govuk-character-count" data-maxlength={maxCharacters}>
                <label className="govuk-label govuk-label--m" htmlFor="withdrawal-reason">
                  {WITHDRAWAL_LABELS.REASON_LABEL}
                </label>
                {WITHDRAWAL_LABELS.REASON_HINT && (
                  <div className="govuk-hint">{WITHDRAWAL_LABELS.REASON_HINT}</div>
                )}
                <textarea
                  className="govuk-textarea govuk-js-character-count"
                  id="withdrawal-reason"
                  name="withdrawal-reason"
                  rows={5}
                  maxLength={maxCharacters}
                  value={withdrawalReason}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= maxCharacters) {
                      setWithdrawalReason(val);
                    } else {
                      setWithdrawalReason(val.slice(0, maxCharacters));
                    }
                  }}
                  aria-describedby="withdrawal-reason-info"
                />
                <div id="withdrawal-reason-info" className="govuk-hint govuk-character-count__message govuk-visually-hidden">
                  You can enter up to {maxCharacters} characters
                </div>
                {typeof remainingChars === 'number' && (
                  <div className="govuk-hint govuk-character-count__message govuk-character-count__status" aria-hidden="true">
                    You have {remainingChars} characters remaining
                  </div>
                )}
                {typeof remainingChars === 'number' && (
                  <div className="govuk-character-count__sr-status govuk-visually-hidden" aria-live="polite">
                    You have {remainingChars} characters remaining
                  </div>
                )}
              </div>

              <div className="govuk-warning-text withdrawal-warning-spacing">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-visually-hidden">Warning</span>
                  {WITHDRAWAL_LABELS.WARNING_TEXT}
                </strong>
              </div>

              <button
                type="submit"
                className="govuk-button govuk-button--warning"
                data-module="govuk-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? BUTTON_LABELS.SUBMITTING : BUTTON_LABELS.SUBMIT_WITHDRAWAL}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WithdrawApplicationPage;
