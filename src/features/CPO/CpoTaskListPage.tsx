import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';
import { CPO_BASE_URL } from '../../constants/cpo';
import { applicationApiService } from '../../services/applicationApiService';
import { progressApiService } from '../../services/progressApiService';
import { CPO_SUBSECTIONS, CPO_TASK_COUNT, CPO_TASK_SECTIONS } from './constants/cpoTaskListConstants';

type CpoProgressItem = {
  subsection_name: string;
  status: string;
};

const CpoTaskListPage: React.FC = () => {
  const { applicationId = '' } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [progress, setProgress] = useState<CpoProgressItem[]>([]);

  useEffect(() => {
    if (!applicationId) return;

    applicationApiService.getApplicationById(applicationId).then(setApplication).catch(() => setApplication(null));
    progressApiService.fetchApplicationProgress(applicationId).then(setProgress).catch(() => setProgress([]));
  }, [applicationId]);

  const progressByTask = useMemo(
    () => new Map(progress.map((item) => [item.subsection_name, item.status])),
    [progress]
  );
  const completedCount = CPO_TASK_SECTIONS.flatMap((section) => section.tasks).filter(
    (task) => progressByTask.get(task.subsection)?.toLowerCase() === 'completed'
  ).length;
  const allOtherTasksCompleted = CPO_TASK_SECTIONS.flatMap((section) => section.tasks)
    .filter((task) => task.subsection !== CPO_SUBSECTIONS.CHECK_AND_SUBMIT)
    .every((task) => progressByTask.get(task.subsection)?.toLowerCase() === 'completed');

  const getTaskStatus = (subsection: string) => {
    if (subsection === CPO_SUBSECTIONS.CHECK_AND_SUBMIT && !allOtherTasksCompleted) {
      return 'Cannot start yet';
    }
    return progressByTask.get(subsection) ?? 'Not completed';
  };

  const renderStatus = (status: string) => {
    if (status === 'Cannot start yet') {
      return <span className="govuk-body">{status}</span>;
    }
    const isComplete = status.toLowerCase() === 'completed';
    return (
      <strong className={`govuk-tag${isComplete ? ' govuk-tag--green' : ' govuk-tag--blue'}`}>
        {isComplete ? 'Completed' : 'Incomplete'}
      </strong>
    );
  };

  const applicationTitle = application?.cpo_order_details?.orderName || 'Compulsory purchase order application';

  return (
    <>
      <PageTitle title={applicationTitle} />
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">
              {application?.application_party?.organisation_name || application?.operator_name || ''}
            </span>
            <h1 className="govuk-heading-l">{applicationTitle}</h1>
            <p className="govuk-body">
              Complete every section, then check and submit your application. You have completed {completedCount} of {CPO_TASK_COUNT} tasks.
            </p>

            {CPO_TASK_SECTIONS.map((section, sectionIndex) => (
              <section className="govuk-!-margin-top-8" key={section.title}>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-4">
                  {sectionIndex + 1}. {section.title}
                </h2>
                <div className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" aria-hidden="true" />
                <ul className="govuk-task-list govuk-!-margin-bottom-1">
                  {section.tasks.map((task) => {
                    const status = getTaskStatus(task.subsection);
                    const isBlocked = status === 'Cannot start yet';
                    const taskUrl = task.slug ? `${CPO_BASE_URL}/${applicationId}/${task.slug}` : undefined;

                    return (
                      <React.Fragment key={task.subsection}>
                        <li className={`govuk-task-list__item${taskUrl && !isBlocked ? ' govuk-task-list__item--with-link' : ''}`}>
                          <span className="govuk-task-list__name-and-hint">
                            {taskUrl && !isBlocked ? (
                              <Link
                                className="govuk-link govuk-task-list__link"
                                to={taskUrl}
                                aria-describedby={task.subsection === CPO_SUBSECTIONS.RECORD_NOTICES ? 'record-notices-hint' : undefined}
                              >
                                {task.label}
                              </Link>
                            ) : (
                              <span
                                className="govuk-task-list__description"
                                aria-describedby={isBlocked ? 'check-and-submit-hint' : undefined}
                              >
                                {task.label}
                              </span>
                            )}
                          </span>
                          <span className="govuk-task-list__status">{renderStatus(status)}</span>
                        </li>
                      </React.Fragment>
                    );
                  })}
                </ul>
                {section.tasks.some((task) => task.subsection === CPO_SUBSECTIONS.RECORD_NOTICES) && (
                  <p className="govuk-body-s govuk-!-margin-bottom-0" id="record-notices-hint">
                    Set the final day for objections before publishing or serving your notices. Record each step as you finish it. If the dates change, check whether your notices or the final day need to change.
                  </p>
                )}
                {section.tasks.some((task) => task.subsection === CPO_SUBSECTIONS.CHECK_AND_SUBMIT) && !allOtherTasksCompleted && (
                  <p className="govuk-body-s govuk-!-margin-bottom-0" id="check-and-submit-hint">
                    You can submit once every other task is completed.
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <button
              className="govuk-button govuk-button--warning"
              type="button"
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
