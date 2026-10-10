import React from 'react';
import { Link } from 'react-router-dom';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import type { CpoTaskSection, CpoTaskStatus } from '../types/cpoTaskList';
import CpoTaskStatusTag from './CpoTaskStatusTag';

type Props = {
  section: CpoTaskSection;
  sectionIndex: number;
  applicationId: string;
  statusOf: (subsection: string) => CpoTaskStatus;
};

const CpoTaskListSection: React.FC<Props> = ({ section, sectionIndex, applicationId, statusOf }) => (
  <section className="govuk-!-margin-top-8">
    <h2 className="govuk-heading-m govuk-!-margin-bottom-4">
      {sectionIndex + 1}. {section.title}
    </h2>
    <div className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" aria-hidden="true" />
    <ul className="govuk-task-list govuk-!-margin-bottom-1">
      {section.tasks.map((task, taskIndex) => {
        const status = statusOf(task.subsection);
        const isBlocked = status === 'Cannot start yet';
        const taskUrl = task.slug ? `${CPO_BASE_URL}/${applicationId}/${task.slug}` : undefined;

        return (
          <li key={task.subsection} className={`govuk-task-list__item${taskUrl && !isBlocked ? ' govuk-task-list__item--with-link' : ''}`}>
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
                <span className="govuk-task-list__description">{task.label}</span>
              )}
            </span>
            <span className="govuk-task-list__status" id={`cpo-task-status-${sectionIndex}-${taskIndex}`}>
              <CpoTaskStatusTag status={status} />
            </span>
          </li>
        );
      })}
    </ul>
  </section>
);

export default CpoTaskListSection;
