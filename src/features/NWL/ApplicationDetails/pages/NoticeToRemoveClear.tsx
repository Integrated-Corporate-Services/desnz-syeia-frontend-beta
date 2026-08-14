import React, { useState, useEffect, useRef } from "react";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import {
  BREADCRUMBS,
  LABELS,
  OPTIONS,
} from "../constants/noticeToRemoveClearConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Notice to Remove Clear Page
 * Does the Notice to Remove clearly refer to the removal of the electric line?
 */
const NoticeToRemoveClear: React.FC = () => {
  const appId = useGetApplicationId();
  const { 
    navigateToApplicationWithinThreeMonths, 
    navigateToNoticeToRemoveUnclear, 
    navigateToTaskList 
  } = useApplicationNavigation(appId || "");
  const { applicationDetails, updateFields } = useApplicationDetailsData(appId);

  const [isNoticeClear, setIsNoticeClear] = useState<string>("");
  const [error, setError] = useState<string>("");
  const initialClearRef = useRef<string | null>(null);

  useEffect(() => {
    // Load saved data if it exists (only when there's an actual boolean value)
    if (applicationDetails?.is_notice_to_remove_clear != null) {
      const clearValue = applicationDetails.is_notice_to_remove_clear ? "yes" : "no";
      setIsNoticeClear(clearValue);
      // Only set initial value once on first load
      if (initialClearRef.current === null) {
        initialClearRef.current = clearValue;
      }
    }
  }, [applicationDetails]);

  const handleClearChange = (newValue: string) => {
    setIsNoticeClear(newValue);
    setError("");
    // Note: Backend call happens only on "Save and continue" button click
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isNoticeClear) {
      setError("Select yes or no");
      return;
    }

    try {
      // Check if user changed their selection
      const hasChangedSelection = initialClearRef.current && initialClearRef.current !== isNoticeClear;
      
      // If selection changed, clear all downstream fields
      if (hasChangedSelection) {
        await updateFields({
          type_of_use: 'existing_lines',
          is_notice_to_remove_clear: isNoticeClear === "yes",
          is_within_three_months: null,
          is_standard_term: null,
          standard_term_explanation: null,
          notice_to_remove_unclear_explanation: null,
        }, APPLICATION_DETAILS_PAGE_IDS.NOTICE_TO_REMOVE_CLEAR);
      } else {
        // Normal save without clearing
        await updateFields({
          type_of_use: 'existing_lines',
          is_notice_to_remove_clear: isNoticeClear === "yes",

        }, APPLICATION_DETAILS_PAGE_IDS.NOTICE_TO_REMOVE_CLEAR);
      }

      // Update the initial ref after successful save
      initialClearRef.current = isNoticeClear;

      // Navigate based on selection
      if (isNoticeClear === "yes") {
        navigateToApplicationWithinThreeMonths();
      } else if (isNoticeClear === "no") {
        navigateToNoticeToRemoveUnclear();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to save');
    }
  };

  return (
    <>
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
                      <a href="#isNoticeClear">{error}</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div
                className={`govuk-form-group ${
                  error ? "govuk-form-group--error" : ""
                }`}
              >
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      {LABELS.PAGE_TITLE}
                    </h1>
                  </legend>
                  {/* <p className="govuk-body">
                    {LABELS.HELPER_TEXT}
                  </p> */}
                  {error && (
                    <p id="isNoticeClear-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {error}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    {OPTIONS.map((option) => (
                      <div key={option.value} className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id={`isNoticeClear-${option.value}`}
                          name="isNoticeClear"
                          type="radio"
                          value={option.value}
                          checked={isNoticeClear === option.value}
                          onChange={(e) => {
                            handleClearChange(e.target.value);
                          }}
                        />
                        <label
                          className="govuk-label govuk-radios__label"
                          htmlFor={`isNoticeClear-${option.value}`}
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>

              <details className="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    {LABELS.GUIDANCE_TITLE}
                  </span>
                </summary>
                <div className="govuk-details__text">
                  {LABELS.GUIDANCE_CONTENT.split('\n\n').map((para, idx) => (
                    <p key={idx} className="govuk-body">
                      {para}
                    </p>
                  ))}
                </div>
              </details>

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

export default NoticeToRemoveClear;
