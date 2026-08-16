import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormButtons } from "../components";
import {
  usePostConsultationData,
  usePostConsultationNavigation,
} from "../hooks";
import {
  POST_CONSULTATION_CONSTANTS,
  POST_CONSULTATION_QUESTIONS,
} from "../constants";
import { SaveType } from "../types";
import PageTitle from "../../../components/PageTitle";

const PostConsultationLpaReason: React.FC = () => {
  const { applicationId, getTaskListUrl, getConsulteesRecommendationsUrl } =
    usePostConsultationNavigation();
  const navigate = useNavigate();
  const {
    explanation,
    setExplanation,
    loading,
    saving,
    error,
    explanationError,
    saveData,
  } = usePostConsultationData(applicationId);

  const remainingChars = POST_CONSULTATION_CONSTANTS.EXPLANATION_MAX_LENGTH - (explanation?.length || 0);
  const hasExceededLimit = remainingChars < 0;

  const handleSubmit = async (e: React.FormEvent, saveType: SaveType) => {
    e.preventDefault();
    const success = await saveData(saveType, "lpa-reason");
    if (success && saveType === "continue") {
      navigate(getConsulteesRecommendationsUrl());
    }
  };

  if (loading) {
    return (
      <>
                <PageTitle title="Reason for disagreeing with LPA" />
                <div className="govuk-width-container">
                    <p className="govuk-body">
            {POST_CONSULTATION_CONSTANTS.LOADING_MESSAGE}
          </p>
                </div>
      </>
    );
  }

  return (
    <>
            <PageTitle title="Reason for disagreeing with LPA" />
            <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link className="govuk-breadcrumbs__link" to={getTaskListUrl()}>
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            {POST_CONSULTATION_CONSTANTS.BREADCRUMB_LABEL}
          </li>
        </ol>
      </nav>
             <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {(error || explanationError || hasExceededLimit) && (
              <div
                className="govuk-error-summary"
                aria-labelledby="error-summary-title"
                role="alert"
                tabIndex={-1}
                data-module="govuk-error-summary"
              >
                <h2
                  className="govuk-error-summary__title"
                  id="error-summary-title"
                >
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    {error && <li>{error}</li>}
                    {explanationError && (
                      <li>
                        <a href="#explanation">{explanationError}</a>
                      </li>
                    )}
                    {hasExceededLimit && (
                      <li>
                        <a href="#explanation">{POST_CONSULTATION_CONSTANTS.ERROR_EXPLANATION_MAX_LENGTH}</a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
            <form noValidate>
              <div
                className={`govuk-form-group ${
                  explanationError || hasExceededLimit ? "govuk-form-group--error" : ""
                }`}
              >
                <h1 className="govuk-label-wrapper">
                  <label
                    className="govuk-label govuk-label--l"
                    htmlFor="explanation"
                  >
                    {POST_CONSULTATION_QUESTIONS.LPA_REASON}
                  </label>
                </h1>
                {explanationError && (
                  <p id="explanation-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>{" "}
                    {explanationError}
                  </p>
                )}
                {hasExceededLimit && (
                  <p id="explanation-length-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>{" "}
                    {POST_CONSULTATION_CONSTANTS.ERROR_EXPLANATION_MAX_LENGTH}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea ${
                    explanationError || hasExceededLimit ? "govuk-textarea--error" : ""
                  }`}
                  id="explanation"
                  name="explanation"
                  rows={5}
                  value={explanation || ""}
                  onChange={(e) => setExplanation(e.target.value)}
                  maxLength={POST_CONSULTATION_CONSTANTS.EXPLANATION_MAX_LENGTH}
                  aria-describedby={
                    explanationError || hasExceededLimit
                      ? "explanation-error explanation-length-error explanation-info"
                      : "explanation-info"
                  }
                />
                <div id="explanation-info" className="govuk-hint govuk-character-count__message" aria-live="polite">
                  You have {Math.max(0, remainingChars)} characters remaining
                </div>
              </div>
              <FormButtons
                onSaveContinue={(e) => handleSubmit(e, "continue")}
                disabled={saving}
              />
            </form>
          </div>
        </div>
            </div>
    </>
  );
};

export default PostConsultationLpaReason;
