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
import SkipLink from "../../../components/SkipLink";

const PostConsultationConsulteesRecommendationsReason: React.FC = () => {
  const { applicationId, getTaskListUrl, getCheckYourAnswersUrl, navigateAfterCompletion } = usePostConsultationNavigation();
  const navigate = useNavigate();
  const {
    consulteesExplanation,
    setConsulteesExplanation,
    loading,
    saving,
    error,
    consulteesRecommendationsReasonError,
    saveData,
  } = usePostConsultationData(applicationId);

  const remainingChars = POST_CONSULTATION_CONSTANTS.EXPLANATION_MAX_LENGTH - (consulteesExplanation?.length || 0);
  const hasExceededLimit = remainingChars < 0;

  const handleSubmit = async (e: React.FormEvent, saveType: SaveType) => {
    e.preventDefault();
    const success = await saveData(
      saveType,
      "consultees-recommendations-reason",
    );
    if (success && saveType === "continue") {
      navigateAfterCompletion();
    }
  };

  if (loading) {
    return (
      <>
        <SkipLink />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content">
          <p className="govuk-body">
            {POST_CONSULTATION_CONSTANTS.LOADING_MESSAGE}
          </p>
        </main>
        </div>
      </>
    );
  }

  return (
    <>
      <SkipLink />
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
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {(error || consulteesRecommendationsReasonError || hasExceededLimit) && (
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
                  {error && (
                    <li>
                      {error.includes('<a href') ? (
                        <span dangerouslySetInnerHTML={{ __html: error }} />
                      ) : (
                        error
                      )}
                    </li>
                  )}
                    {consulteesRecommendationsReasonError && (
                      <li>
                        <a href="#consultees-explanation">
                          {consulteesRecommendationsReasonError}
                        </a>
                      </li>
                    )}
                    {hasExceededLimit && (
                      <li>
                        <a href="#consultees-explanation">{POST_CONSULTATION_CONSTANTS.ERROR_EXPLANATION_MAX_LENGTH}</a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
            <form noValidate>
              <div
                className={`govuk-form-group ${
                  consulteesRecommendationsReasonError || hasExceededLimit
                    ? "govuk-form-group--error"
                    : ""
                }`}
              >
                <h1 className="govuk-label-wrapper">
                  <label
                    className="govuk-label govuk-label--l"
                    htmlFor="consultees-explanation"
                  >
                    {POST_CONSULTATION_QUESTIONS.CONSULTEES_REASON}
                  </label>
                </h1>
                {consulteesRecommendationsReasonError && (
                  <p
                    id="consultees-explanation-error"
                    className="govuk-error-message"
                  >
                    <span className="govuk-visually-hidden">Error:</span>{" "}
                    {consulteesRecommendationsReasonError}
                  </p>
                )}
                {hasExceededLimit && (
                  <p
                    id="consultees-explanation-length-error"
                    className="govuk-error-message"
                  >
                    <span className="govuk-visually-hidden">Error:</span>{" "}
                    {POST_CONSULTATION_CONSTANTS.ERROR_EXPLANATION_MAX_LENGTH}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea ${
                    consulteesRecommendationsReasonError || hasExceededLimit
                      ? "govuk-textarea--error"
                      : ""
                  }`}
                  id="consultees-explanation"
                  name="consulteesExplanation"
                  rows={5}
                  value={consulteesExplanation || ""}
                  onChange={(e) => setConsulteesExplanation(e.target.value)}
                  maxLength={POST_CONSULTATION_CONSTANTS.EXPLANATION_MAX_LENGTH}
                  aria-describedby={
                    consulteesRecommendationsReasonError || hasExceededLimit
                      ? "consultees-explanation-error consultees-explanation-length-error consultees-explanation-info"
                      : "consultees-explanation-info"
                  }
                />
                <div id="consultees-explanation-info" className="govuk-hint govuk-character-count__message" aria-live="polite">
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
      </main>
      </div>
    </>
  );
};

export default PostConsultationConsulteesRecommendationsReason;
