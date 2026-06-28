import React, { useState, useEffect, useRef } from "react";
import SkipLink from '../../../../components/SkipLink';
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import {
  BREADCRUMBS,
  LABELS,
  OPTIONS,
} from "../constants/applicationWithinThreeMonthsConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Application Within Three Months Page
 * Is your application being submitted within three months of the Notice to Remove?
 */
const ApplicationWithinThreeMonths: React.FC = () => {
  const appId = useGetApplicationId();
  const { 
    navigateToStandardTerm, 
    navigateToApplicationOutsideTimeframe, 
    navigateToTaskList 
  } = useApplicationNavigation(appId || "");
  const { applicationDetails, updateFields } = useApplicationDetailsData(appId);

  const [isWithinThreeMonths, setIsWithinThreeMonths] = useState<string>("");
  const [error, setError] = useState<string>("");
  const initialWithinRef = useRef<string | null>(null);

  useEffect(() => {
    // Load saved data if it exists (only when there's an actual boolean value)
    if (applicationDetails?.is_within_three_months != null) {
      const withinValue = applicationDetails.is_within_three_months ? "yes" : "no";
      setIsWithinThreeMonths(withinValue);
      // Only set initial value once on first load
      if (initialWithinRef.current === null) {
        initialWithinRef.current = withinValue;
      }
    }
  }, [applicationDetails]);

  const handleWithinChange = (newValue: string) => {
    setIsWithinThreeMonths(newValue);
    setError("");
    // Note: Backend call happens only on "Save and continue" button click
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isWithinThreeMonths) {
      setError("Select yes or no");
      return;
    }

    try {
      // Check if user changed their selection
      const hasChangedSelection = initialWithinRef.current && initialWithinRef.current !== isWithinThreeMonths;
      
      // If selection changed, clear all downstream fields
      if (hasChangedSelection) {
        await updateFields({
          type_of_use: 'existing_lines',
          is_within_three_months: isWithinThreeMonths === "yes",
          application_outside_timeframe_explanation: null,
          is_standard_term: null,
          standard_term_explanation: null,
        }, APPLICATION_DETAILS_PAGE_IDS.APPLICATION_WITHIN_THREE_MONTHS);
      } else {
        // Normal save without clearing
        await updateFields({
          type_of_use: 'existing_lines',
          is_within_three_months: isWithinThreeMonths === "yes",
        }, APPLICATION_DETAILS_PAGE_IDS.APPLICATION_WITHIN_THREE_MONTHS);
      }

      // Update the initial ref after successful save
      initialWithinRef.current = isWithinThreeMonths;

      // Navigate based on selection
      if (isWithinThreeMonths === "yes") {
        navigateToStandardTerm();
      } else if (isWithinThreeMonths === "no") {
        navigateToApplicationOutsideTimeframe();
      }
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
                      <a href="#isWithinThreeMonths">{error}</a>
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
                  <p className="govuk-body">
                    {LABELS.HELPER_TEXT}
                  </p>
                  {error && (
                    <p id="isWithinThreeMonths-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {error}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    {OPTIONS.map((option) => (
                      <div key={option.value} className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id={`isWithinThreeMonths-${option.value}`}
                          name="isWithinThreeMonths"
                          type="radio"
                          value={option.value}
                          checked={isWithinThreeMonths === option.value}
                          onChange={(e) => {
                            handleWithinChange(e.target.value);
                          }}
                        />
                        <label
                          className="govuk-label govuk-radios__label"
                          htmlFor={`isWithinThreeMonths-${option.value}`}
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
    </>
  );
};

export default ApplicationWithinThreeMonths;
