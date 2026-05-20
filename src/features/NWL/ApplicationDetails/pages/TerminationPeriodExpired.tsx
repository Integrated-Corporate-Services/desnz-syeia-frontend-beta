import React, { useState, useEffect } from "react";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import {
  BREADCRUMBS,
  LABELS,
  OPTIONS,
} from "../constants/terminationPeriodExpiredConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Termination Period Expired Page
 * Has the termination period expired?
 */
const TerminationPeriodExpired: React.FC = () => {
  const appId = useGetApplicationId();
  const { 
    navigateToNoticeToRemove, 
    navigateToCannotContinueApplication, 
    navigateToTaskList 
  } = useApplicationNavigation(appId || "");
  const { applicationDetails, updateFields } = useApplicationDetailsData(appId);

  const [hasExpired, setHasExpired] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Load saved data if it exists (only when there's an actual boolean value)
    if (applicationDetails?.termination_period_expired != null) {
      setHasExpired(applicationDetails.termination_period_expired ? "yes" : "no");
    }
  }, [applicationDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!hasExpired) {
      setError("Select yes or no");
      return;
    }

    try {
      // Save to backend
      // This page is only for existing_lines flow
      // Pass page name constant for page-specific validation
      await updateFields({
        type_of_use: 'existing_lines',
        termination_period_expired: hasExpired === "yes",
      }, APPLICATION_DETAILS_PAGE_IDS.TERMINATION_PERIOD_EXPIRED);

      // Navigate based on selection
      if (hasExpired === "yes") {
        navigateToNoticeToRemove();
      } else if (hasExpired === "no") {
        navigateToCannotContinueApplication();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to save');
    }
  };

  // const handleSaveForLater = () => {
  //   navigateToTaskList();
  // };

  return (
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
                      <a href="#hasExpired">{error}</a>
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
                  <div className="govuk-warning-text">
                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                    <strong className="govuk-warning-text__text">
                      <span className="govuk-visually-hidden">Warning</span>
                      {LABELS.HELPER_TEXT}
                    </strong>
                  </div>
                  {error && (
                    <p id="hasExpired-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {error}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    {OPTIONS.map((option) => (
                      <div key={option.value} className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id={`hasExpired-${option.value}`}
                          name="hasExpired"
                          type="radio"
                          value={option.value}
                          checked={hasExpired === option.value}
                          onChange={(e) => {
                            setHasExpired(e.target.value);
                            setError("");
                          }}
                        />
                        <label
                          className="govuk-label govuk-radios__label"
                          htmlFor={`hasExpired-${option.value}`}
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                >
                  Save and continue
                </button>
                {/* <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                >
                  Save for later
                </button> */}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TerminationPeriodExpired;
