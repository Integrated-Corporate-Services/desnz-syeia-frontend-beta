import React from "react";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplicationNavigation } from "../hooks";
import {
  LABELS,
} from "../constants/cannotContinueApplicationConstants";

/**
 * Cannot Continue Application Page
 * Dead end page when termination period has not expired
 */
const CannotContinueApplication: React.FC = () => {
  const appId = useGetApplicationId();
  const { navigateToTaskList } = useApplicationNavigation(appId || "");

  const handleSaveForLater = () => {
    navigateToTaskList();
  };

  const handleReturnToTaskList = () => {
    navigateToTaskList();
  };

  return (
    <div className="govuk-width-container">
      <a
        href="#"
        className="govuk-back-link"
        onClick={(e) => {
          e.preventDefault();
          window.history.back();
        }}
      >
        Back
      </a>

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.PAGE_TITLE}</h1>

            <p className="govuk-body">
              {LABELS.HELPER_TEXT}
            </p>

            <p className="govuk-body govuk-!-font-weight-bold">
              {LABELS.GUIDANCE_TITLE}
            </p>

            <ul className="govuk-list govuk-list--bullet">
              {LABELS.GUIDANCE_POINTS.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            <p className="govuk-body">
              {LABELS.CONTACT_INFO}
            </p>

            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={handleSaveForLater}
              >
                {LABELS.SAVE_FOR_LATER_BUTTON}
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={handleReturnToTaskList}
              >
                {LABELS.RETURN_TO_TASK_LIST_BUTTON}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CannotContinueApplication;
