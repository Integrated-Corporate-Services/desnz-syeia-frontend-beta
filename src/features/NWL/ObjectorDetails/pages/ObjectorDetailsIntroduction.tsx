import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import {
  BREADCRUMBS,
  LABELS,
  INTRODUCTION_CONTENT,
} from "../constants/objectorDetailsConstants";

/**
 * Objector Details Introduction Page
 * Provides overview of information to be collected about objector and related parties
 */
const ObjectorDetailsIntroduction: React.FC = () => {
  const navigate = useNavigate();
  const appId = useGetApplicationId();

  const handleContinue = () => {
    (async () => {
      
      navigate(`${NWL_BASE_URL}/${appId}/objector-details`);
    })();
  };

  return (
    <>
      <PageTitle title="Objector and other parties' details" />
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
            {BREADCRUMBS.OBJECTOR_DETAILS}
          </li>
        </ol>
      </nav>

              <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.INTRODUCTION_TITLE}</h1>

            <p className="govuk-body">{INTRODUCTION_CONTENT.HEADING}</p>

            <ul className="govuk-list govuk-list--bullet">
              {INTRODUCTION_CONTENT.POINTS.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={handleContinue}
            >
              {LABELS.CONTINUE}
            </button>
          </div>
        </div>
            </div>
    </>
  );
};

export default ObjectorDetailsIntroduction;
