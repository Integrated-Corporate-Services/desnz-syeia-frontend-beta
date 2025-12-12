import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applicationApiService } from '../../../services/applicationApiService';
import { S37_BASE_URL } from '../../../constants/s37';

const DeleteApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (!applicationId) return;
    setSubmitting(true);
    setError(null);
    try {
      await applicationApiService.deleteApplication(applicationId);
      navigate('/workbasket');
    } catch (err) {
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
          <h1 className="govuk-heading-l" id="delete-application-heading">
            Are you sure you want to delete this application?
          </h1>
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
        </div>
      </div>
    </main>
  );
};

export default DeleteApplicationPage;
