import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTaskListData } from '../../../hooks/useTaskListData';
import TaskListSection from '../components/TaskListSection';
import SensitiveAreaBanner from '../components/SensitiveAreaBanner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import type { AuthUser } from '../../../types/auth';
import { ROLES } from '../../../constants/roles';
import { getInitialSections } from '../../../utils/taskListUtils';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { applicationApiService } from '../../../services/applicationApiService';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('TaskList');

const TaskList: React.FC = () => {
  const { user } = useAuthUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = (user as AuthUser)?.role === ROLES.DESNZ_ADMIN;
  const applicationId = useGetApplicationId();
  const [assetInformationStatus, setAssetInformationStatus] = useState<string>('Incomplete');

  // Use the hook to get sections from useTaskListData
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

  // Determine the base URL from the current path
  const getBaseUrl = () => {
    const pathname = location.pathname;
    if (pathname.includes('/s-37/')) return '/s-37';
    if (pathname.includes('/nwl/')) return '/nwl';
    if (pathname.includes('/tlp/')) return '/tlp';
    return '/s-37'; // fallback
  };

  const handleDeleteClick = () => {
    logger.info('Delete application button clicked', { applicationId });
    const baseUrl = getBaseUrl();
    navigate(`${baseUrl}/${applicationId}/delete-confirmation`);
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to="/workbasket">Workbasket</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item govuk-breadcrumbs__list-item--current" aria-current="true">Task list</li>
        </ol>
      </nav>
      {application?.status?.toLowerCase() === 'submitted' && (
        <div className="govuk-notification-banner govuk-notification-banner--success" role="alert" aria-labelledby="govuk-notification-banner-title" data-module="govuk-notification-banner">
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
              Application submitted
            </h2>
          </div>
          <div className="govuk-notification-banner__content">
            <p className="govuk-notification-banner__heading">
              {isAdmin 
                ? 'This application has been submitted. As an admin, you can still edit the application.'
                : 'This application has been submitted and can no longer be edited or deleted.'}
            </p>
          </div>
        </div>
      )}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <SensitiveAreaBanner status={sensitiveAreaStatus} checkJustStarted={showSensitiveAreaPopup} />
          {!application ? (
            <>
              <h1 className="govuk-heading-l">Loading application...</h1>
            </>
          ) : (
            <div className="govuk-!-margin-top-2">
              <span className="govuk-caption-l">{application.operator_name || application.application_party?.organisation_name || ''}</span>
              <h1 className="govuk-heading-l govuk-!-margin-top-2 govuk-!-margin-bottom-2">{application.type === 'S37' ? 'Section 37' : application.type} application</h1>
              <p className="govuk-body" style={{ color: '#505a5f' }}>
                {application.status?.toLowerCase() === 'submitted' 
                  ? (isAdmin 
                      ? 'This application has been submitted. As an admin, you can still make changes if needed.'
                      : 'This application has been submitted. You can view the information but cannot make changes.')
                  : 'Complete the following sections in order to create and submit your application'}
              </p>
            </div>
          )}
          <ErrorMessage error={submitError} />
          
          {sections.map((section, idx) => (
            <TaskListSection
              key={section.title}
              section={section}
              idx={idx}
              applicationId={application?.application_id}
              applicationStatus={application?.status}
              isAdmin={isAdmin}
              submitting={submitting}
              handleSubmit={handleSubmit}
              statusClass={statusClass}
            />
          ))}
          
          {/* Delete application button - positioned at the end */}
          {application && (application.status?.toLowerCase() !== 'submitted' || isAdmin) && (
            <div className="govuk-!-margin-top-6">
              <button 
                className="govuk-button govuk-button--warning"
                onClick={handleDeleteClick}
                disabled={submitting}
              >
                Delete application
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;