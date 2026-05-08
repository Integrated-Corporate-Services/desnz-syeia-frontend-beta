import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { useApplicationNavigation } from "../hooks";
import {
  BREADCRUMBS,
  LABELS,
  OPTIONS,
} from "../constants/applicationWithinThreeMonthsConstants";

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
  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );

  const [isWithinThreeMonths, setIsWithinThreeMonths] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  useEffect(() => {
    // Load saved data if it exists
    if (application?.is_within_three_months !== undefined) {
      setIsWithinThreeMonths(application.is_within_three_months ? "yes" : "no");
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Save to backend when API is ready
    // Navigate based on selection
    if (isWithinThreeMonths === "yes") {
      navigateToStandardTerm();
    } else if (isWithinThreeMonths === "no") {
      navigateToApplicationOutsideTimeframe();
    }
  };

  const handleSaveForLater = () => {
    navigateToTaskList();
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
                            setIsWithinThreeMonths(e.target.value);
                            setError("");
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

export default ApplicationWithinThreeMonths;
