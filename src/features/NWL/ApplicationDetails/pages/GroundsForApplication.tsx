import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import {
  BREADCRUMBS,
  LABELS,
  GROUNDS_OPTIONS,
} from "../constants/groundsForApplicationConstants";

/**
 * Grounds For Application Page
 * Choose the relevant option for the application (Paragraph 8(1) selection)
 */
const GroundsForApplication: React.FC = () => {
  const navigate = useNavigate();
  const appId = useGetApplicationId();
  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );

  const [groundsForApplication, setGroundsForApplication] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  useEffect(() => {
    // Load saved data if it exists
    if (application?.grounds_for_application) {
      setGroundsForApplication(application.grounds_for_application);
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Save to backend when API is ready
    // Navigate based on selection, passing the grounds as state
    if (groundsForApplication === "wayleave_expired") {
      navigate(`${NWL_BASE_URL}/${appId}/wayleave-type`, { 
        state: { grounds_for_application: "wayleave_expired" } 
      });
    } else if (groundsForApplication === "wayleave_terminated") {
      navigate(`${NWL_BASE_URL}/${appId}/wayleave-type`, { 
        state: { grounds_for_application: "wayleave_terminated" } 
      });
    } else if (groundsForApplication === "no_wayleave_exists") {
      navigate(`${NWL_BASE_URL}/${appId}/notice-to-remove`);
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
                            setGroundsForApplication(e.target.value);
                            setError("");
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

export default GroundsForApplication;
