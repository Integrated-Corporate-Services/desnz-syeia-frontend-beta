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

const PostConsultationConsulteesRecommendations: React.FC = () => {
  const { applicationId, getTaskListUrl, navigateAfterCompletion } = usePostConsultationNavigation();
  const navigate = useNavigate();
  const {
    consulteesRecommendations,
    setConsulteesRecommendations,
    loading,
    saving,
    error,
    consulteesRecommendationsError,
    saveData,
  } = usePostConsultationData(applicationId);

  const handleSubmit = async (e: React.FormEvent, saveType: SaveType) => {
    e.preventDefault();
    const success = await saveData(saveType, "consultees-recommendations");
    if (success && saveType === "continue") {
      if (consulteesRecommendations === "yes") {
        navigate(
          `/s-37/${applicationId}/post-consultation-actions/consultees-recommendations-acceptance`,
        );
      } else {
        navigateAfterCompletion();
      }
    }
  };

  if (loading) {
    return (
      <>
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
            {(error || consulteesRecommendationsError) && (
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
                    {consulteesRecommendationsError && (
                      <li>
                        <a href="#consultees-recommendations-yes">
                          {consulteesRecommendationsError}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
            <form noValidate>
              <div
                className={`govuk-form-group ${
                  consulteesRecommendationsError
                    ? "govuk-form-group--error"
                    : ""
                }`}
              >
                <fieldset
                  className="govuk-fieldset"
                  aria-describedby={
                    consulteesRecommendationsError
                      ? "consultees-recommendations-error"
                      : undefined
                  }
                >
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      {POST_CONSULTATION_QUESTIONS.CONSULTEES_RECOMMENDATIONS}
                    </h1>
                  </legend>
                  {consulteesRecommendationsError && (
                    <p
                      id="consultees-recommendations-error"
                      className="govuk-error-message"
                    >
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {consulteesRecommendationsError}
                    </p>
                  )}
                  <div className="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="consultees-recommendations-yes"
                        name="consulteesRecommendations"
                        type="radio"
                        value="yes"
                        checked={consulteesRecommendations === "yes"}
                        onChange={() => setConsulteesRecommendations("yes")}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="consultees-recommendations-yes"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="consultees-recommendations-no"
                        name="consulteesRecommendations"
                        type="radio"
                        value="no"
                        checked={consulteesRecommendations === "no"}
                        onChange={() => setConsulteesRecommendations("no")}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="consultees-recommendations-no"
                      >
                        No
                      </label>
                    </div>
                  </div>
                </fieldset>
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

export default PostConsultationConsulteesRecommendations;
