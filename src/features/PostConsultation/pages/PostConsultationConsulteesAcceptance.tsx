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

const PostConsultationConsulteesRecommendationsAcceptance: React.FC = () => {
  const { applicationId, getTaskListUrl, navigateAfterCompletion } = usePostConsultationNavigation();
  const navigate = useNavigate();
  const {
    acceptConsulteesRecommendations,
    setAcceptConsulteesRecommendations,
    loading,
    saving,
    error,
    acceptConsulteesRecommendationsError,
    saveData,
  } = usePostConsultationData(applicationId);

  const handleSubmit = async (e: React.FormEvent, saveType: SaveType) => {
    e.preventDefault();
    const success = await saveData(
      saveType,
      "consultees-recommendations-acceptance",
    );
    if (success && saveType === "continue") {
      if (acceptConsulteesRecommendations === "yes") {
        navigateAfterCompletion();
      } else {
        navigate(
          `/s-37/${applicationId}/post-consultation-actions/consultees-recommendations-reason`,
        );
      }
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
            {(error || acceptConsulteesRecommendationsError) && (
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
                    {acceptConsulteesRecommendationsError && (
                      <li>
                        <a href="#accept-consultees-recommendations-yes">
                          {acceptConsulteesRecommendationsError}
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
                  acceptConsulteesRecommendationsError
                    ? "govuk-form-group--error"
                    : ""
                }`}
              >
                <fieldset
                  className="govuk-fieldset"
                  aria-describedby={
                    acceptConsulteesRecommendationsError
                      ? "accept-consultees-recommendations-error"
                      : undefined
                  }
                >
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      {POST_CONSULTATION_QUESTIONS.CONSULTEES_ACCEPTANCE.LINE1}
                      <br />
                      {POST_CONSULTATION_QUESTIONS.CONSULTEES_ACCEPTANCE.LINE2}
                    </h1>
                  </legend>
                  {acceptConsulteesRecommendationsError && (
                    <p
                      id="accept-consultees-recommendations-error"
                      className="govuk-error-message"
                    >
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {acceptConsulteesRecommendationsError}
                    </p>
                  )}
                  <div className="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="accept-consultees-recommendations-yes"
                        name="acceptConsulteesRecommendations"
                        type="radio"
                        value="yes"
                        checked={acceptConsulteesRecommendations === "yes"}
                        onChange={() =>
                          setAcceptConsulteesRecommendations("yes")
                        }
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="accept-consultees-recommendations-yes"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="accept-consultees-recommendations-no"
                        name="acceptConsulteesRecommendations"
                        type="radio"
                        value="no"
                        checked={acceptConsulteesRecommendations === "no"}
                        onChange={() =>
                          setAcceptConsulteesRecommendations("no")
                        }
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="accept-consultees-recommendations-no"
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
      </main>
      </div>
    </>
  );
};

export default PostConsultationConsulteesRecommendationsAcceptance;
