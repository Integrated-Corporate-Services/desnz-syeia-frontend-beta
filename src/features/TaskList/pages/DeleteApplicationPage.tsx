import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applicationApiService } from '../../../services/applicationApiService';
import { S37_BASE_URL } from '../../../constants/s37';
import { useApplication } from '../../../hooks/useApplication';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import type { AuthUser } from '../../../types/auth';
import { ROLES } from '../../../constants/roles';

const DeleteApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { application, fetchApplication } = useApplication();
  const { user } = useAuthUserContext();
  const isAdmin = (user as AuthUser)?.role === ROLES.DESNZ_ADMIN;

  useEffect(() => {
    if (applicationId) {
      fetchApplication(applicationId);
    }
  }, [applicationId, fetchApplication]);

  const isSubmitted = application?.status?.toLowerCase() === 'submitted';
  const canDelete = !isSubmitted || isAdmin;

  const handleDelete = async () => {
    if (!applicationId) return;
    if (!canDelete) {
      setError('Cannot delete a submitted application.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await applicationApiService.deleteApplication(applicationId);
      navigate('/application-dashboard');
    } catch (_err) {
      setError('Failed to delete application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
  navigate(`${S37_BASE_URL}/${applicationId}/task-list`);  
};

  return (
    <main className="govuk-width-container" id="main-content" tabIndex={-1}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {isSubmitted && !isAdmin ? (
            <>
              <h1 className="govuk-heading-l">Cannot delete application</h1>
              <p className="govuk-body">
                This application has been submitted and cannot be deleted.
              </p>
              <button
                type="button"
                className="govuk-button"
                onClick={handleCancel}
                aria-label="Go back to application overview"
              >
                Go back to application overview
              </button>
            </>
          ) : (
            <>
              <h1 className="govuk-heading-l" id="delete-application-heading">
                Are you sure you want to delete this application?
              </h1>
              {isSubmitted && isAdmin && (
                <div className="govuk-warning-text">
                  <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                  <strong className="govuk-warning-text__text">
                    <span className="govuk-warning-text__assistive">Warning</span>
                    This application has been submitted. As an admin, you can still delete it.
                  </strong>
                </div>
              )}
              <p className="govuk-body">
                This will remove all of the information you have entered and remove the application from your dashboard.
              </p>
              {error && <div className="govuk-error-message" role="alert">{error}</div>}
              <div className="govuk-button-group">
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleCancel}
                  aria-label="Go back to application overview"
                  disabled={submitting}
                >
                  Go back to application overview
                </button>
                <button
                  type="button"
                  className="govuk-button govuk-button--warning"
                  onClick={handleDelete}
                  aria-label="Delete application"
                  data-module="govuk-button"
                  disabled={submitting}
                >
                  {submitting ? 'Deleting...' : 'Delete application'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default DeleteApplicationPage;
