import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { useApplicationNavigation } from "../hooks";
import {
  BREADCRUMBS,
  LABELS,
} from "../constants/applicationOutsideTimeframeConstants";

/**
 * Application Outside Timeframe Page
 * Why is your application being submitted more than 3 months after the Notice to Remove?
 */
const ApplicationOutsideTimeframe: React.FC = () => {
  const appId = useGetApplicationId();
  const { navigateToStandardTerm } = useApplicationNavigation(appId || "");
  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );

  const [explanation, setExplanation] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  useEffect(() => {
    // Load saved data if it exists
    if (application?.application_outside_timeframe_explanation) {
      setExplanation(application.application_outside_timeframe_explanation);
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Save to backend when API is ready
    navigateToStandardTerm();
  };

  // const handleSaveForLater = () => {
  //   navigateToTaskList();
  // };

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
                      <a href="#explanation">{error}</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-l">{LABELS.PAGE_TITLE}</h1>

         

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
                  rows={8}
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

export default ApplicationOutsideTimeframe;
