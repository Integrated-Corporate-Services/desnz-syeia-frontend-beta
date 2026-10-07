import React from 'react';
import { Link, useParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { CPO_BASE_URL } from '../../../constants/cpo';
import { CPO_TASK_SECTIONS } from '../constants/cpoTaskListConstants';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';

const CpoTaskUnavailablePage: React.FC = () => {
  const { taskSlug = '' } = useParams();
  const applicationId = useCpoApplicationId();
  const task = CPO_TASK_SECTIONS.flatMap((section) => section.tasks).find(
    (item) => item.slug === taskSlug
  );
  const title = task?.label ?? 'Compulsory purchase order task';

  return (
    <>
      <PageTitle title={title} />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">{title}</h1>
          <p className="govuk-body">This task is not available yet.</p>
          <Link className="govuk-link" to={`${CPO_BASE_URL}/${applicationId}/task-list`}>
            Back to the application task list
          </Link>
        </div>
      </div>
    </>
  );
};

export default CpoTaskUnavailablePage;
