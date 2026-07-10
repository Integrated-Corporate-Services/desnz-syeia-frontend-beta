import React, { useState, useEffect, useRef } from "react";
import SkipLink from '../../../../components/SkipLink';
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import { useNWLProgress } from "../../hooks/useNWLProgress";
import { VALIDATION_MESSAGES } from "../services/applicationDetailsService";
import {
  BREADCRUMBS,
  LABELS,
  OPTIONS,
} from "../constants/standardTermConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";
import { ERROR_MESSAGES } from "../../../../constants/error";

const StandardTerm: React.FC = () => {
  const appId = useGetApplicationId();
  const { navigateToTaskList } = useApplicationNavigation(appId || "");
  const { applicationDetails, updateFields, isLoading } = useApplicationDetailsData(appId);
  const { updateProgress } = useNWLProgress(appId || undefined);

  const [isStandardTerm, setIsStandardTerm] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [versionError, setVersionError] = useState<string>("");
  const [explanationError, setExplanationError] = useState<string>("");
  const initialTermRef = useRef<string | null>(null);
  const versionRef = useRef<number | undefined>(undefined);

  const typeOfUse = applicationDetails?.type_of_use || 'existing_lines';

  useEffect(() => {
    if (applicationDetails?.is_standard_term != null) {
      const termValue = applicationDetails.is_standard_term ? "yes" : "no";
      setIsStandardTerm(termValue);
      if (initialTermRef.current === null) {
        initialTermRef.current = termValue;
      }
    }
    if (applicationDetails?.standard_term_explanation) {
      setExplanation(applicationDetails.standard_term_explanation);
    } else if (applicationDetails && (applicationDetails.standard_term_explanation === null || applicationDetails.standard_term_explanation === '')) {
      // Explicitly clear local state if explanation was set to null or empty string
      setExplanation("");
    }
    // Track version for optimistic locking
    if (applicationDetails?.version !== undefined) {
      versionRef.current = applicationDetails.version;
    }
  }, [applicationDetails]);

  const handleTermChange = (newValue: string) => {
    setIsStandardTerm(newValue);
    setError("");
    setVersionError("");
    
    if (newValue === "yes") {
      setExplanation("");
      setExplanationError("");
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setError("");
    setExplanationError("");

    if (!isStandardTerm) {
      setError(VALIDATION_MESSAGES.RADIO_REQUIRED);
      isValid = false;
    }

    if (isStandardTerm === "no" && !explanation.trim()) {
      setExplanationError(VALIDATION_MESSAGES.TEXT_REQUIRED);
      isValid = false;
    }

    if (explanation.length > LABELS.CHAR_LIMIT) {
      setExplanationError(VALIDATION_MESSAGES.TEXT_MAX_LENGTH(LABELS.CHAR_LIMIT));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateFields({
        type_of_use: typeOfUse,
        is_standard_term: isStandardTerm === "yes",
        standard_term_explanation: isStandardTerm === "yes" ? null : explanation,
        version: versionRef.current,
      }, APPLICATION_DETAILS_PAGE_IDS.STANDARD_TERM);

      initialTermRef.current = isStandardTerm;

      await updateProgress('Grounds for application', 'Completed');

      navigateToTaskList();
    } catch (err: unknown) {
      const error = err as any;
      // Handle version conflict
      if (error.statusCode === 409 || error.isVersionConflict) {
        setVersionError(ERROR_MESSAGES.VERSION_CONFLICT);
      } else {
        setError(error.message || 'Failed to save');
      }
    }
  };

  const characterCount = explanation.length;
  const charactersRemaining = LABELS.CHAR_LIMIT - characterCount;

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
            {versionError && (
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
                  <div dangerouslySetInnerHTML={{ __html: versionError }} />
                </div>
              </div>
            )}
            {(error || explanationError) && (
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
                    {error && (
                      <li>
                        <a href="#isStandardTerm">{error}</a>
                      </li>
                    )}
                    {explanationError && (
                      <li>
                        <a href="#explanation">{explanationError}</a>
                      </li>
                    )}
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
                  <p className="govuk-hint">
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
                            handleTermChange(e.target.value);
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
                      <div className={`govuk-form-group ${explanationError ? "govuk-form-group--error" : ""}`}>
                        <label className="govuk-label govuk-label--s govuk-bold" htmlFor="explanation">
                          {LABELS.TEXTAREA_LABEL}
                        </label>
                        {explanationError && (
                          <p id="explanation-error" className="govuk-error-message">
                            <span className="govuk-visually-hidden">Error:</span> {explanationError}
                          </p>
                        )}
                        <textarea
                          className={`govuk-textarea  ${explanationError ? "govuk-textarea--error" : ""}`}
                          id="explanation"
                          name="explanation"
                          rows={5}
                          aria-describedby={explanationError ? "explanation-error explanation-hint" : "explanation-hint"}
                          value={explanation}
                          onChange={(e) => {
                            setExplanation(e.target.value);
                            setExplanationError("");
                          }}
                          maxLength={LABELS.CHAR_LIMIT}
                        />
                        <div
                          id="explanation-hint"
                          className="govuk-hint govuk-character-count__message"
                          aria-live="polite"
                        >
                          {charactersRemaining >= 0
                            ? `You have ${charactersRemaining.toLocaleString()} characters remaining`
                            : `You have ${Math.abs(charactersRemaining).toLocaleString()} characters too many`}
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

export default StandardTerm;
