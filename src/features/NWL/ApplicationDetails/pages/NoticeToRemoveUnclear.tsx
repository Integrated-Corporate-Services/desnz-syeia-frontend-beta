import React, { useState, useEffect } from "react";
import SkipLink from '../../../../components/SkipLink';
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import {
  BREADCRUMBS,
  LABELS,
} from "../constants/noticeToRemoveUnclearConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Notice to Remove Unclear Page
 * Explain why you consider the Notice to Remove to be unclear
 */
const NoticeToRemoveUnclear: React.FC = () => {
  const appId = useGetApplicationId();
  const { navigateToApplicationWithinThreeMonths, navigateToTaskList } = useApplicationNavigation(appId || "");
  const { applicationDetails, updateFields } = useApplicationDetailsData(appId);

  const [explanation, setExplanation] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Load saved data if it exists, or clear if it's been reset to null or empty
    if (applicationDetails?.notice_to_remove_unclear_explanation) {
      setExplanation(applicationDetails.notice_to_remove_unclear_explanation);
    } else if (applicationDetails && (applicationDetails.notice_to_remove_unclear_explanation === null || applicationDetails.notice_to_remove_unclear_explanation === '')) {
      // Explicitly clear local state if explanation was set to null or empty string
      setExplanation("");
    }
  }, [applicationDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!explanation.trim()) {
      setError("Explain why the Notice to Remove is unclear");
      return;
    }

    try {
      // Save to backend
      // This page is only for existing_lines flow
      // Pass page name constant for page-specific validation
      await updateFields({
        type_of_use: 'existing_lines',
        is_notice_to_remove_clear: false,
        notice_to_remove_unclear_explanation: explanation.trim(),
      }, APPLICATION_DETAILS_PAGE_IDS.NOTICE_TO_REMOVE_UNCLEAR);

      navigateToApplicationWithinThreeMonths();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to save');
    }
  };

  return (
    <>
      <SkipLink />
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

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content">
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

            <div className="govuk-inset-text">
              {LABELS.HELPER_TEXT}
            </div>

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
                  className={`govuk-textarea ${
                    error ? "govuk-textarea--error" : ""
                  }`}
                  id="explanation"
                  name="explanation"
                  rows={5}
                  aria-describedby="explanation-hint"
                  value={explanation}
                  onChange={(e) => {
                    setExplanation(e.target.value);
                    setError("");
                  }}
                  maxLength={LABELS.CHAR_LIMIT}
                />
              </div>
 <div className="govuk-hint" id="explanation-hint">
                  You can enter up to {LABELS.CHAR_LIMIT.toLocaleString()} characters
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
      </main>
    </div>
    </>
  );
};

export default NoticeToRemoveUnclear;
