import React from "react";
import { Link } from "react-router-dom";
import { LPAModificationsQuestion, FormButtons } from "../components";
import {
  usePostConsultationData,
  usePostConsultationNavigation,
} from "../hooks";
import { POST_CONSULTATION_CONSTANTS } from "../constants";
import { SaveType } from "../types";

const PostConsultation: React.FC = () => {
  const { applicationId, getTaskListUrl, handleNavigationAfterSave } =
    usePostConsultationNavigation();

  const {
    lpaModifications,
    setLpaModifications,
    acceptConditions,
    setAcceptConditions,
    explanation,
    setExplanation,
    loading,
    saving,
    error,
    saveData,
  } = usePostConsultationData(applicationId);

  const handleSubmit = async (e: React.FormEvent, saveType: SaveType) => {
    e.preventDefault();
    const success = await saveData(saveType);
    handleNavigationAfterSave(saveType, success);
  };

  if (loading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content">
          <p className="govuk-body">
            {POST_CONSULTATION_CONSTANTS.LOADING_MESSAGE}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
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
            <h1 className="govuk-heading-xl">
              {POST_CONSULTATION_CONSTANTS.PAGE_TITLE}
            </h1>

            {error && (
              <div
                className="govuk-error-summary"
                aria-labelledby="error-summary-title"
                role="alert"
              >
                <h2
                  className="govuk-error-summary__title"
                  id="error-summary-title"
                >
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form noValidate>
              <LPAModificationsQuestion
                lpaModifications={lpaModifications}
                acceptConditions={acceptConditions}
                explanation={explanation}
                onLpaModificationsChange={setLpaModifications}
                onAcceptConditionsChange={setAcceptConditions}
                onExplanationChange={setExplanation}
              />

              <FormButtons
                onSaveLater={(e) => handleSubmit(e, "later")}
                onSaveContinue={(e) => handleSubmit(e, "continue")}
                disabled={saving}
              />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostConsultation;
