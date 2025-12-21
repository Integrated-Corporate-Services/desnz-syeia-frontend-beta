import React from 'react';
import { useTaskListData } from '../../../hooks/useTaskListData';
import TaskListSection from '../components/TaskListSection';
import SensitiveAreaBanner from '../components/SensitiveAreaBanner';
import ErrorMessage from '../components/ErrorMessage';

const TaskList: React.FC = () => {
  const {
    application,
    sections,
    submitting,
    submitError,
    handleSubmit,
    sensitiveAreaStatus,
    showBanner,
    setShowBanner,
    deletedRouteName,
    setDeletedRouteName,
    showSensitiveAreaPopup,
    setShowSensitiveAreaPopup,
    handleStatusUpdate,
    statusClass,
    progressLoading,
    progressError,
  } = useTaskListData();

  return (
    <div className="govuk-width-container">
      <SensitiveAreaBanner status={sensitiveAreaStatus} />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {!application ? (
            <>
              <h1 className="govuk-heading-l">Loading application...</h1>
            </>
          ) : (
            <>
              <span className="govuk-caption-l">{application.operator_name || application.application_party?.organisation_name || ''}</span>
              <h1 className="govuk-heading-l">{application.type === 'S37' ? 'Section 37' : application.type} application</h1>
              <p className="govuk-body" style={{ color: '#505a5f' }}>Complete the following sections in order to create and submit your application</p>
            </>
          )}
          <ErrorMessage error={submitError} />
          {sections.map((section, idx) => (
            <TaskListSection
              key={section.title}
              section={section}
              idx={idx}
              applicationId={application?.application_id}
              submitting={submitting}
              handleSubmit={handleSubmit}
              statusClass={statusClass}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
