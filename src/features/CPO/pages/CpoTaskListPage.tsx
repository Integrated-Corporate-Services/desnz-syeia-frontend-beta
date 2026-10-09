import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { CPO_BASE_URL } from '../../../constants/cpo';
import { applicationApiService } from '../../../services/applicationApiService';
import { progressApiService } from '../../../services/progressApiService';
import { CPO_SUBSECTIONS, CPO_TASK_SECTIONS } from '../constants/cpoTaskListConstants';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';

type CpoProgressItem = {
  subsection_name: string;
  status: string;
};

const CpoTaskListPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [progress, setProgress] = useState<CpoProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const errorSummary = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([applicationApiService.getApplicationById(applicationId), progressApiService.fetchApplicationProgress(applicationId)])
      .then(([saved, savedProgress]) => {
        if (!active) return;
        if (saved.type !== 'CPO') throw new Error('Not a CPO application');
        setApplication(saved); setProgress(savedProgress);
      }).catch(() => { if (active) setError('Unable to load the CPO task list. Refresh the page to try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId]);

  useEffect(() => { if (error) errorSummary.current?.focus(); }, [error]);

  const progressByTask = useMemo(
    () => new Map(progress.map(item => [item.subsection_name,
      item.subsection_name === CPO_SUBSECTIONS.RECORD_NOTICES && item.status.toLowerCase() === 'completed'
        && (application?.cpo_publicity?.requirements?.acknowledged !== true || application?.cpo_publicity?.check?.confirmed !== true)
        ? 'Not completed' : item.status])),
    [progress, application]
  );
  const allOtherTasksCompleted = CPO_TASK_SECTIONS.flatMap((section) => section.tasks)
    .filter((task) => task.subsection !== CPO_SUBSECTIONS.CHECK_AND_SUBMIT)
    .every((task) => progressByTask.get(task.subsection)?.toLowerCase() === 'completed');

  const getTaskStatus = (subsection: string) => {
    if (subsection === CPO_SUBSECTIONS.CHECK_AND_SUBMIT && !allOtherTasksCompleted) {
      return 'Cannot start yet';
    }
    const status = progressByTask.get(subsection)?.toLowerCase();
    return status === 'completed' ? 'Completed' : status === 'in progress' ? 'In progress' : 'Not completed';
  };

  const renderStatus = (status: string) => {
    const colour = status === 'Completed' ? 'green' : status === 'Cannot start yet' ? 'grey' : 'blue';
    return (
      <strong className={`govuk-tag govuk-tag--${colour}`}>
        {status}
      </strong>
    );
  };

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
              <section className="govuk-!-margin-top-8" key={section.title}>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-4">
                  {sectionIndex + 1}. {section.title}
                </h2>
                <div className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" aria-hidden="true" />
                <ul className="govuk-task-list govuk-!-margin-bottom-1">
                  {section.tasks.map((task, taskIndex) => {
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
                                aria-describedby={`cpo-task-status-${sectionIndex}-${taskIndex}`}
                              >
                                {task.label}
                              </Link>
                            ) : (
                              <span
                                className="govuk-task-list__description"
                              >
                                {task.label}
                              </span>
                            )}
                          </span>
                          <span className="govuk-task-list__status" id={`cpo-task-status-${sectionIndex}-${taskIndex}`}>{renderStatus(status)}</span>
                        </li>
                      </React.Fragment>
                    );
                  })}
                </ul>
              </section>
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
