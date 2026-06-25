import React, { useState, useEffect, useRef } from "react";
import SkipLink from '../../../../components/SkipLink';
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { 
  useApplicationNavigation, 
  useApplicationDetailsData
} from "../hooks";
import { VALIDATION_MESSAGES } from "../services/applicationDetailsService";
import {
  BREADCRUMBS,
  LABELS,
  GROUNDS_OPTIONS,
} from "../constants/groundsForApplicationConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Grounds For Application Page
 * Choose the relevant option for the application (Paragraph 8(1) selection)
 */
const GroundsForApplication: React.FC = () => {
  const appId = useGetApplicationId();
  const { applicationDetails, updateFields, isLoading } = useApplicationDetailsData(appId);
  const {
    navigateToWayleaveType,
    navigateToNoticeToRemove,
    navigateToWayleaveOffer,
    navigateToTaskList,
  } = useApplicationNavigation(appId || "");

  const [groundsForApplication, setGroundsForApplication] = useState<string>("");
  const [error, setError] = useState<string>("");
  const initialGroundsRef = useRef<string | null>(null);

  // Check type_of_use and redirect if new_lines
  useEffect(() => {
    if (applicationDetails?.type_of_use === 'new_lines') {
      // Redirect to WayleaveOffer page for new lines flow
      navigateToWayleaveOffer();
    }
  }, [applicationDetails?.type_of_use, navigateToWayleaveOffer]);

  useEffect(() => {
    // Load saved data and track the initial value
    if (applicationDetails?.grounds_for_application) {
      setGroundsForApplication(applicationDetails.grounds_for_application);
      // Only set initial value once on first load
      if (initialGroundsRef.current === null) {
        initialGroundsRef.current = applicationDetails.grounds_for_application;
      }
    }
  }, [applicationDetails]);

  const handleGroundsChange = (newValue: string) => {
    setGroundsForApplication(newValue);
    setError("");
    // Note: Backend call happens only on "Save and continue" button click
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!groundsForApplication) {
      setError(VALIDATION_MESSAGES.RADIO_REQUIRED);
      return;
    }

    try {
      // Check if the selection has changed from the previously saved value
      const hasChangedSelection = initialGroundsRef.current && initialGroundsRef.current !== groundsForApplication;

      // If selection changed, prevent the change and show error message
      if (hasChangedSelection) {
        setError("You cannot change the Para 8 legislation type. To make this change, you must create a new application.");
        return;
      }

      // Save the current selection
      await updateFields({ 
        type_of_use: 'existing_lines',
        grounds_for_application: groundsForApplication 
      }, APPLICATION_DETAILS_PAGE_IDS.GROUNDS_FOR_APPLICATION);

      // Update the initial ref after successful save
      initialGroundsRef.current = groundsForApplication;

      // Navigate based on selection
      if (groundsForApplication === "wayleave_expired") {
        navigateToWayleaveType("wayleave_expired");
      } else if (groundsForApplication === "wayleave_terminated") {
        navigateToWayleaveType("wayleave_terminated");
      } else if (groundsForApplication === "no_wayleave_exists") {
        navigateToNoticeToRemove();
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
                      <a href="#groundsForApplication">{error}</a>
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
                    <a
                      href={LABELS.LEGISLATION_LINK_URL}
                      className="govuk-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {LABELS.LEGISLATION_LINK_TEXT}
                    </a>
                    .
                  </p>
                  {error && (
                    <p id="groundsForApplication-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {error}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    {GROUNDS_OPTIONS.map((option) => (
                      <div key={option.value} className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id={`groundsForApplication-${option.value}`}
                          name="groundsForApplication"
                          type="radio"
                          value={option.value}
                          checked={groundsForApplication === option.value}
                          onChange={(e) => {
                            handleGroundsChange(e.target.value);
                          }}
                        />
                        <label
                          className="govuk-label govuk-radios__label"
                          htmlFor={`groundsForApplication-${option.value}`}
                        >
                          {option.label}
                        </label>
                        {option.hint && (
                          <div className="govuk-hint govuk-radios__hint">
                            {option.hint}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    {LABELS.OBJECTOR_TITLE}
                  </span>
                </summary>
                <div className="govuk-details__text">
                  {LABELS.OBJECTOR_CONTENT}
                </div>
              </details>

              <p className="govuk-body">
                <a
                  href={LABELS.GUIDANCE_LINK_URL}
                  className="govuk-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {LABELS.GUIDANCE_LINK_TEXT}
                </a>
              </p>

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save and continue'}
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

export default GroundsForApplication;
