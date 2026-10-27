import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { CPO_TASK_SECTIONS } from '../constants/cpoTaskListConstants';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';
import { useCpoTaskList } from '../hooks/useCpoTaskList';
import CpoTaskListSection from '../components/CpoTaskListSection';

const CpoTaskListPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const navigate = useNavigate();
  const { application, loading, error, statusOf } = useCpoTaskList(applicationId);
  const errorSummary = useRef<HTMLDivElement>(null);

  useEffect(() => { if (error) errorSummary.current?.focus(); }, [error]);

  const applicationTitle = 'Compulsory purchase order';

  return (
    <>
      <PageTitle title={applicationTitle} />
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {loading && <p className="govuk-body" role="status">Loading your task list...</p>}
            {error && <div className="govuk-error-summary" role="alert" ref={errorSummary} tabIndex={-1}><h2 className="govuk-error-summary__title">There is a problem</h2><div className="govuk-error-summary__body"><p>{error}</p></div></div>}
            {!loading && !error && <>
            <span className="govuk-caption-l">
              {application?.application_party?.organisation_name || application?.operator_name || ''}
            </span>
            <h1 className="govuk-heading-l">{applicationTitle}</h1>
            <p className="govuk-body">
              Complete the following sections in order to create and submit your application.
            </p>

            {CPO_TASK_SECTIONS.map((section, sectionIndex) => (
              <CpoTaskListSection
                key={section.title}
                section={section}
                sectionIndex={sectionIndex}
                applicationId={applicationId}
                statusOf={statusOf}
              />
            ))}
            </>}
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <button
              className="govuk-button govuk-button--warning"
              type="button"
              disabled={loading || Boolean(error)}
              onClick={() => navigate(`${CPO_BASE_URL}/${applicationId}/delete-confirmation`)}
            >
              Delete application
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CpoTaskListPage;
