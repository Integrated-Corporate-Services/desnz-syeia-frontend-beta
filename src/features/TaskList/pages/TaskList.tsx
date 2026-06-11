<<<<<<< Updated upstream
import React, { useEffect, useState } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> Stashed changes
import { useNavigate, useLocation } from 'react-router-dom';
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
import AssignedEditorBanner from '../../Assignment/components/AssignedEditorBanner';
import { assignmentApiService, type AssignedEditor } from '../../../services/assignmentApiService';

const logger = createLogger('TaskList');

const TaskList: React.FC = () => {
  const { user } = useAuthUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = (user as AuthUser)?.role === ROLES.DESNZ_ADMIN;
  const applicationId = useGetApplicationId();
  const [assetInformationStatus, setAssetInformationStatus] = useState<string>('Incomplete');
  const [assignedEditor, setAssignedEditor] = useState<AssignedEditor | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(false);

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

<<<<<<< Updated upstream
  useEffect(() => {
    if (!application?.application_id || !user?.user_id) {
      return;
    }

    const pathname = location.pathname;
    const baseUrl = pathname.includes('/s-37/')
      ? '/s-37'
      : pathname.includes('/nwl/')
        ? '/nwl'
        : pathname.includes('/tlp/')
          ? '/tlp'
          : '/s-37';
    const isSupportedBase = baseUrl === '/s-37' || baseUrl === '/nwl';

    if (!isSupportedBase) {
      return;
    }

    const isOtherApplicantsApplication = application.created_by !== user.user_id;
    if (!isOtherApplicantsApplication) {
      return;
    }

    const normalizedStatus = application.status?.toLowerCase();

    if (normalizedStatus === 'draft') {
      navigate(`${baseUrl}/${application.application_id}/check-your-answers`, { replace: true });
      return;
    }

    if (normalizedStatus === 'submitted') {
      navigate(`${baseUrl}/${application.application_id}/application-summary`, { replace: true });
    }
  }, [application, user?.user_id, location.pathname, navigate]);
=======
  const handleReassignClick = () => {
    logger.info('Reassign button clicked', { applicationId });
    const baseUrl = getBaseUrl();
    navigate(`${baseUrl}/${applicationId}/reassign`);
  };

  // Fetch assignment data for draft applications
  useEffect(() => {
    const fetchAssignment = async () => {
      console.log('[TaskList] Checking assignment fetch conditions:', {
        applicationId,
        applicationIdType: typeof applicationId,
        applicationIdLength: applicationId?.length,
        hasApplication: !!application,
        status: application?.status,
        userRole: (user as AuthUser)?.role,
        expectedRole: ROLES.APPLICANT_TEAM_COORDINATOR
      });

      // Don't fetch if applicationId is empty or undefined
      if (!applicationId || applicationId === '') {
        console.warn('[TaskList] Skipping fetch - no applicationId');
        return;
      }
      
      if (!application) return;
      if (application.status?.toLowerCase() !== 'draft') return;
      
      // Only fetch if user is TC (can reassign)
      const userRole = (user as AuthUser)?.role;
      if (userRole !== ROLES.APPLICANT_TEAM_COORDINATOR) return;

      try {
        setLoadingAssignment(true);
        console.log('[TaskList] Fetching assigned editor for app:', applicationId);
        const data = await assignmentApiService.getAssignedEditor(applicationId);
        console.log('[TaskList] Assigned editor data:', data);
        setAssignedEditor(data.assignedEditor);
      } catch (error) {
        console.error('[TaskList] Failed to fetch assigned editor:', error);
        logger.error('Failed to fetch assigned editor', { error, applicationId });
      } finally {
        setLoadingAssignment(false);
      }
    };

    fetchAssignment();
  }, [applicationId, application, user]);
>>>>>>> Stashed changes

  return (
    <div className="govuk-width-container">
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
          {/* Show assignment banner for draft applications when user is TC */}
          {(() => {
            const isDraft = application?.status?.toLowerCase() === 'draft';
            const isTC = (user as AuthUser)?.role === ROLES.APPLICANT_TEAM_COORDINATOR;
            console.log('[TaskList] Banner render check:', {
              isDraft,
              isTC,
              loadingAssignment,
              hasEditor: !!assignedEditor,
              applicationId
            });
            
            if (isDraft && isTC && !loadingAssignment) {
              return (
                <AssignedEditorBanner
                  editor={assignedEditor}
                  canReassign={true}
                  onReassign={handleReassignClick}
                  applicationId={applicationId || ''}
                />
              );
            }
            return null;
          })()}
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