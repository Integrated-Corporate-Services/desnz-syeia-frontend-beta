import React, { useState, useEffect } from "react";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import {
  BREADCRUMBS,
  LABELS,
} from "../constants/applicationOutsideTimeframeConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";
import PageTitle from "../../../../components/PageTitle";

/**
 * Application Outside Timeframe Page
 * Why is your application being submitted more than 3 months after the Notice to Remove?
 */
const ApplicationOutsideTimeframe: React.FC = () => {
  const appId = useGetApplicationId();
  const { navigateToStandardTerm, navigateToTaskList } = useApplicationNavigation(appId || "");
  const { applicationDetails, updateFields } = useApplicationDetailsData(appId);

  const [explanation, setExplanation] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Load saved data if it exists, or clear if it's been reset to null or empty
    if (applicationDetails?.application_outside_timeframe_explanation) {
      setExplanation(applicationDetails.application_outside_timeframe_explanation);
    } else if (applicationDetails && (applicationDetails.application_outside_timeframe_explanation === null || applicationDetails.application_outside_timeframe_explanation === '')) {
      // Explicitly clear local state if explanation was set to null or empty string
      setExplanation("");
    }
  }, [applicationDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!explanation.trim()) {
      setError("Explain why your application is being submitted more than 3 months after the Notice to Remove");
      return;
    }

    try {
      // Save to backend
      // This page is only for existing_lines flow
      // Pass page name constant for page-specific validation
      await updateFields({
        type_of_use: 'existing_lines',
        is_within_three_months: false,
        application_outside_timeframe_explanation: explanation.trim(),
      }, APPLICATION_DETAILS_PAGE_IDS.APPLICATION_OUTSIDE_TIMEFRAME);

      navigateToStandardTerm();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to save');
    }
  };

  const characterCount = explanation.length;
  const charactersRemaining = LABELS.CHAR_LIMIT - characterCount;

  return (
    <>
      <PageTitle title="Application outside timeframe" />
          <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <a
              className="govuk-breadcrumbs__link"
              href="#"
              onClick={(e) => { e.preventDefault(); navigateToTaskList(); }}
            >
              {BREADCRUMBS.TASK_LIST}
            </a>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            {BREADCRUMBS.APPLICATION_DETAILS}
          </li>
        </ol>
      </nav>

              <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {error && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
              >
                <h2 className="govuk-error-summary__title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li>
                      <a href="#explanation">{error}</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-l">{LABELS.PAGE_TITLE}</h1>

            {/* <p className="govuk-body">
              {LABELS.HELPER_TEXT}
            </p> */}

            <form onSubmit={handleSubmit} noValidate>
              <div
                className={`govuk-form-group ${
                  error ? "govuk-form-group--error" : ""
                }`}
              >
              
              
                {error && (
                  <p id="explanation-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {error}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea  ${
                    error ? "govuk-textarea--error" : ""
                  }`}
                  id="explanation"
                  name="explanation"
                  rows={5}
                  aria-describedby={error ? "explanation-error explanation-hint" : "explanation-hint"}
                  value={explanation}
                  onChange={(e) => {
                    setExplanation(e.target.value);
                    setError("");
                  }}
                  maxLength={LABELS.CHAR_LIMIT}
                />
                <div
                  id="explanation-hint"
                  className="govuk-hint govuk-character-count__message"
                  aria-live="polite"
                >
                  {charactersRemaining >= 0
                    ? `You have ${charactersRemaining.toLocaleString()} characters remaining`
                    : `You have ${Math.abs(charactersRemaining).toLocaleString()} characters too many`}
                </div>
              </div>
              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                >
                  Save and continue
                </button>
              </div>
            </form>
          </div>
        </div>
          </div>
    </>
  );
};

export default ApplicationOutsideTimeframe;
