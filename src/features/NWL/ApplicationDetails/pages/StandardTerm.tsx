import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import {
  BREADCRUMBS,
  LABELS,
  OPTIONS,
} from "../constants/standardTermConstants";

/**
 * Standard Term Page
 * Are you applying for the standard term of 15 years?
 */
const StandardTerm: React.FC = () => {
  const navigate = useNavigate();
  const appId = useGetApplicationId();
  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );

  const [isStandardTerm, setIsStandardTerm] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  useEffect(() => {
    // Load saved data if it exists
    if (application?.is_standard_term !== undefined) {
      setIsStandardTerm(application.is_standard_term ? "yes" : "no");
    }
    if (application?.standard_term_explanation) {
      setExplanation(application.standard_term_explanation);
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Save to backend when API is ready
    navigate(`${NWL_BASE_URL}/${appId}/task-list`);
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
                      <a href="#isStandardTerm">{error}</a>
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
                    <p id="isStandardTerm-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {error}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios" data-aria-controls="conditional-explanation">
                    {OPTIONS.map((option) => (
                      <div key={option.value} className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id={`isStandardTerm-${option.value}`}
                          name="isStandardTerm"
                          type="radio"
                          value={option.value}
                          checked={isStandardTerm === option.value}
                          onChange={(e) => {
                            setIsStandardTerm(e.target.value);
                            setError("");
                          }}
                          data-aria-controls={option.value === "no" ? "conditional-explanation" : undefined}
                        />
                        <label
                          className="govuk-label govuk-radios__label"
                          htmlFor={`isStandardTerm-${option.value}`}
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {isStandardTerm === "no" && (
                    <div className="govuk-radios__conditional" id="conditional-explanation">
                      <div className="govuk-form-group">
                        <label className="govuk-label govuk-label--s govuk-bold" htmlFor="explanation">
                          {LABELS.TEXTAREA_LABEL}
                        </label>
                      
                        <textarea
                          className="govuk-textarea"
                          id="explanation"
                          name="explanation"
                          rows={8}
                          aria-describedby="explanation-hint"
                          value={explanation}
                          onChange={(e) => setExplanation(e.target.value)}
                          maxLength={LABELS.CHAR_LIMIT}
                        />
                          <div className="govuk-hint" id="explanation-hint">
                          You can enter up to {LABELS.CHAR_LIMIT.toLocaleString()} characters
                        </div>
                      </div>
                    </div>
                  )}
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

export default StandardTerm;
