import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import {
  BREADCRUMBS,
  LABELS,
  FORM_ERRORS,
  WAYLEAVE_EXPIRED_OPTIONS,
  WAYLEAVE_TERMINATED_OPTIONS,
  WAYLEAVE_TERMINATED_DETAILS,
} from "../constants/wayleaveTypeConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Wayleave Type Page
 * What type of wayleave existed?
 * 
 * Content varies based on grounds_for_application:
 * - wayleave_expired: Shows "Inherited necessary wayleave" and "Wayleave"
 * - wayleave_terminated: Shows "Implied wayleave" and "Wayleave"
 */
const WayleaveType: React.FC = () => {
  const location = useLocation();
  const appId = useGetApplicationId();
  const { 
    navigateToWayleaveExpiryDate, 
    navigateToUploadWrittenWayleave, 
    navigateToUploadImpliedWayleave, 
    navigateToTaskList 
  } = useApplicationNavigation(appId || "");
  const { applicationDetails, updateFields, isLoading } = useApplicationDetailsData(appId);

  const [wayleaveType, setWayleaveType] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Get grounds_for_application from location state or applicationDetails
  const groundsForApplication = 
    (location.state as any)?.grounds_for_application || 
    applicationDetails?.grounds_for_application;

  // Determine which options to show based on grounds_for_application
  const options = useMemo(() => {
    if (groundsForApplication === 'wayleave_expired') {
      return WAYLEAVE_EXPIRED_OPTIONS;
    } else {
      // Default to wayleave_terminated options
      return WAYLEAVE_TERMINATED_OPTIONS;
    }
  }, [groundsForApplication]);

  useEffect(() => {
    // Load saved data if it exists, or clear if it's been reset to null
    if (applicationDetails?.wayleave_type) {
      setWayleaveType(applicationDetails.wayleave_type);
    } else if (applicationDetails && applicationDetails.wayleave_type === null) {
      // Explicitly clear local state if wayleave_type was set to null
      setWayleaveType("");
    }
  }, [applicationDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if a selection has been made
    if (!wayleaveType) {
      setError(FORM_ERRORS.MISSING_TYPE);
      return;
    }

    try {
      // Save to backend
      // This page is only for existing_lines flow
      // Pass page ID constant for page-specific validation
      await updateFields({ 
        type_of_use: 'existing_lines',
        wayleave_type: wayleaveType 
      }, APPLICATION_DETAILS_PAGE_IDS.WAYLEAVE_TYPE);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to save');
      return;
    }

    // Navigate based on grounds for application and wayleave type selection
    
    if (groundsForApplication === "wayleave_expired") {
      // For expired wayleave flow: always go to wayleave expiry date regardless of type
      navigateToWayleaveExpiryDate();
    } else if (groundsForApplication === "wayleave_terminated") {
      // For terminated wayleave flow: go to upload pages based on type
      if (wayleaveType === "wayleave") {
        navigateToUploadWrittenWayleave();
      } else if (wayleaveType === "implied_wayleave") {
        navigateToUploadImpliedWayleave();
      }
    } else {
      // Fallback: navigate based on wayleave type if grounds not recognized
      if (wayleaveType === "wayleave") {
        navigateToUploadWrittenWayleave();
      } else if (wayleaveType === "implied_wayleave") {
        navigateToUploadImpliedWayleave();
      } else if (wayleaveType === "inherited_necessary_wayleave") {
        navigateToUploadImpliedWayleave();
      }
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
                      <a href="#wayleaveType">{error}</a>
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
                  {error && (
                    <p id="wayleaveType-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {error}
                    </p>
                  )}
                  <div className="govuk-radios govuk-!-margin-bottom-6" data-module="govuk-radios">
                    {options.map((option) => (
                      <div key={option.value} className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id={`wayleaveType-${option.value}`}
                          name="wayleaveType"
                          type="radio"
                          value={option.value}
                          checked={wayleaveType === option.value}
                          onChange={(e) => {
                            setWayleaveType(e.target.value);
                            setError("");
                          }}
                        />
                        <label
                          className="govuk-label govuk-radios__label"
                          htmlFor={`wayleaveType-${option.value}`}
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

                  {/* Only show details for wayleave_terminated flow (implied wayleave) */}
                  {groundsForApplication === 'wayleave_terminated' && (
                    <details className="govuk-details">
                      <summary className="govuk-details__summary">
                        <span className="govuk-details__summary-text">
                          {WAYLEAVE_TERMINATED_DETAILS.SUMMARY}
                        </span>
                      </summary>
                      <div className="govuk-details__text">
                        <p className="govuk-body">{WAYLEAVE_TERMINATED_DETAILS.TEXT_1}</p>
                        <p className="govuk-body">{WAYLEAVE_TERMINATED_DETAILS.TEXT_2}</p>
                        <p className="govuk-body">{WAYLEAVE_TERMINATED_DETAILS.TEXT_3}</p>
                        <p className="govuk-body">
                          Read the{" "}
                          <a
                            href={WAYLEAVE_TERMINATED_DETAILS.LINK_URL}
                            className="govuk-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {WAYLEAVE_TERMINATED_DETAILS.LINK_TEXT}
                          </a>{" "}
                          for more information.
                        </p>
                      </div>
                    </details>
                  )}
                </fieldset>
              </div>

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

export default WayleaveType;
