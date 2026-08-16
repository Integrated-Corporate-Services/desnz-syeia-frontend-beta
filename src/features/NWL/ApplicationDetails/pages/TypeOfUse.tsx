import React, { useState, useEffect, useRef } from "react";
import PageTitle from "../../../../components/PageTitle";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import { useNWLProgress } from "../../hooks/useNWLProgress";
import {
  BREADCRUMBS,
  LABELS,
  TYPE_OF_USE_OPTIONS,
  FORM_ERRORS,
} from "../constants/typeOfUseConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";
import { VALIDATION_MESSAGES } from "../services/applicationDetailsService";
import { createLogger } from "../../../../utils/logger";

const logger = createLogger('TypeOfUse');

const TypeOfUse: React.FC = () => {
  const appId = useGetApplicationId();
  const { applicationDetails, saveDetails, isLoading } = useApplicationDetailsData(appId);
  const { updateProgress } = useNWLProgress(appId || undefined);
  
  const {
    navigateToWayleaveOffer,
    navigateToGroundsForApplication,
    navigateToTaskList,
  } = useApplicationNavigation(appId || "");

  const [typeOfUse, setTypeOfUse] = useState<string>("");
  const [error, setError] = useState<string>("");
  const initialTypeRef = useRef<string | null>(null);

  useEffect(() => {
    if (applicationDetails?.type_of_use) {
      setTypeOfUse(applicationDetails.type_of_use);
      if (initialTypeRef.current === null) {
        initialTypeRef.current = applicationDetails.type_of_use;
      }
    }
  }, [applicationDetails]);

  const handleTypeChange = (newValue: string) => {
    setTypeOfUse(newValue);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!typeOfUse) {
      setError(VALIDATION_MESSAGES.RADIO_REQUIRED);
      return;
    }

    try {
      const hasChangedSelection = initialTypeRef.current && initialTypeRef.current !== typeOfUse;

      if (hasChangedSelection) {
        setError(FORM_ERRORS.CANNOT_CHANGE_TYPE);
        return;
      }

      await saveDetails({
        application_id: appId!,
        type_of_use: typeOfUse,
      }, APPLICATION_DETAILS_PAGE_IDS.TYPE_OF_USE);

      initialTypeRef.current = typeOfUse;

      try {
        await updateProgress('Type of use', 'Completed');
      } catch (progressError) {
        logger.error('Failed to update progress:', progressError);
      }

      if (typeOfUse === "new_lines") {
        navigateToWayleaveOffer();
      } else if (typeOfUse === "existing_lines") {
        navigateToGroundsForApplication();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to save');
    }
  };

  return (
    <>
      <PageTitle title="New or existing electric lines?" />
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
            {BREADCRUMBS.LINE_TYPE}
          </li>
        </ol>
      </nav>

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
                      <a href="#typeOfUse">{error}</a>
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
                  <div className="govuk-hint">
                    {LABELS.HINT_TEXT}
                  </div>
                  {error && (
                    <p id="typeOfUse-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {error}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    {TYPE_OF_USE_OPTIONS.map((option) => (
                      <div key={option.value} className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id={`typeOfUse-${option.value}`}
                          name="typeOfUse"
                          type="radio"
                          value={option.value}
                          checked={typeOfUse === option.value}
                          onChange={(e) => {
                            handleTypeChange(e.target.value);
                          }}
                        />
                        <label
                          className="govuk-label govuk-radios__label"
                          htmlFor={`typeOfUse-${option.value}`}
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
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save and continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
          </div>
    </>
  );
};

export default TypeOfUse;
