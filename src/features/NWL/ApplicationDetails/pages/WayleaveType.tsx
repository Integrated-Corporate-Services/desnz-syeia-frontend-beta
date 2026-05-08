import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import {
  BREADCRUMBS,
  LABELS,
  WAYLEAVE_TYPE_OPTIONS,
} from "../constants/wayleaveTypeConstants";

/**
 * Wayleave Type Page
 * What type of wayleave existed?
 */
const WayleaveType: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const appId = useGetApplicationId();
  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );

  const [wayleaveType, setWayleaveType] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Get grounds_for_application from location state or application
  const groundsForApplication = 
    (location.state as any)?.grounds_for_application || 
    application?.grounds_for_application;

  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  useEffect(() => {
    // Load saved data if it exists
    if (application?.wayleave_type) {
      setWayleaveType(application.wayleave_type);
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if a selection has been made
    if (!wayleaveType) {
      setError("Select the type of wayleave that existed");
      return;
    }

    // TODO: Save to backend when API is ready
    // Navigate based on grounds for application and wayleave type selection
    
    if (groundsForApplication === "wayleave_expired") {
      // For expired wayleave flow: always go to wayleave expiry date regardless of type
      navigate(`${NWL_BASE_URL}/${appId}/wayleave-expiry-date`);
    } else if (groundsForApplication === "wayleave_terminated") {
      // For terminated wayleave flow: go to upload pages based on type
      if (wayleaveType === "wayleave") {
        navigate(`${NWL_BASE_URL}/${appId}/upload-written-wayleave`);
      } else if (wayleaveType === "interim_necessary_wayleave") {
        navigate(`${NWL_BASE_URL}/${appId}/upload-implied-wayleave`);
      }
    } else {
      // Fallback: navigate based on wayleave type if grounds not recognized
      if (wayleaveType === "wayleave") {
        navigate(`${NWL_BASE_URL}/${appId}/upload-written-wayleave`);
      } else if (wayleaveType === "interim_necessary_wayleave") {
        navigate(`${NWL_BASE_URL}/${appId}/upload-implied-wayleave`);
      }
    }
  };

  const handleSaveForLater = () => {
    navigate(`${NWL_BASE_URL}/${appId}/task-list`);
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${NWL_BASE_URL}/${appId}/task-list`}
            >
              {BREADCRUMBS.TASK_LIST}
            </Link>
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
                    {WAYLEAVE_TYPE_OPTIONS.map((option) => (
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

                  <details className="govuk-details">
                    <summary className="govuk-details__summary">
                      <span className="govuk-details__summary-text">
                        {LABELS.DETAILS_SUMMARY}
                      </span>
                    </summary>
                    <div className="govuk-details__text">
                      <p className="govuk-body">{LABELS.DETAILS_TEXT_1}</p>
                      <p className="govuk-body">{LABELS.DETAILS_TEXT_2}</p>
                      <p className="govuk-body">{LABELS.DETAILS_TEXT_3}</p>
                      <p className="govuk-body">
                        <a
                          href={LABELS.DETAILS_LINK_URL}
                          className="govuk-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {LABELS.DETAILS_LINK_TEXT}
                        </a>
                      </p>
                    </div>
                  </details>
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
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                >
                  Save for later
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WayleaveType;
