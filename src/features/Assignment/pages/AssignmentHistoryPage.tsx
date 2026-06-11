/**
 * Assignment History Page
 * Shows timeline of all editor assignments and reassignments
 * Created: 2026-06-09
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { assignmentApiService, AssignmentHistoryEntry } from '../../../services/assignmentApiService';

export const AssignmentHistoryPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  // Extract app type from URL for navigation
  const appType = window.location.pathname.split('/')[2]; // Gets 's-37' from '/frontend/s-37/...'

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AssignmentHistoryEntry[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await assignmentApiService.getAssignmentHistory(
          applicationId!,
          50,
          0
        );
        setHistory(response.history);
      } catch (err: any) {
        setError(err.message || 'Failed to load assignment history');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <LoadingSpinner message="Loading assignment history..." />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <div className="govuk-error-summary" data-module="govuk-error-summary">
            <div role="alert">
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <p>{error}</p>
              </div>
            </div>
          </div>
          <button
            className="govuk-button"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </main>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INITIAL_ASSIGNMENT':
        return 'Initial assignment';
      case 'REASSIGNMENT':
        return 'Reassigned';
      case 'SELF_REASSIGNMENT':
        return 'Self-assigned';
      case 'SYSTEM_ASSIGNMENT':
        return 'System assignment';
      default:
        return type;
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Assignment history</h1>

            {history.length === 0 ? (
              <p className="govuk-body">No assignment history available.</p>
            ) : (
              <div className="govuk-timeline">
                {history.map((entry, index) => (
                  <div key={entry.id} className="govuk-timeline__item">
                    <div className="govuk-timeline__marker">
                      <span className="govuk-visually-hidden">{index + 1}</span>
                    </div>
                    <div className="govuk-timeline__content">
                      <h2 className="govuk-heading-s govuk-!-margin-bottom-1">
                        {getTypeLabel(entry.reassignmentType)}
                      </h2>
                      <p className="govuk-body-s govuk-!-text-secondary govuk-!-margin-bottom-2">
                        {formatDate(entry.changedAt)}
                      </p>
                      
                      <dl className="govuk-summary-list govuk-summary-list--no-border">
                        {entry.prevEditor && (
                          <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">From</dt>
                            <dd className="govuk-summary-list__value">
                              {entry.prevEditor.fullName || entry.prevEditor.email}
                            </dd>
                          </div>
                        )}
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">
                            {entry.prevEditor ? 'To' : 'Assigned to'}
                          </dt>
                          <dd className="govuk-summary-list__value">
                            {entry.newEditor.fullName || entry.newEditor.email}
                          </dd>
                        </div>
                        {entry.changedBy && (
                          <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">Changed by</dt>
                            <dd className="govuk-summary-list__value">
                              {entry.changedBy.fullName || entry.changedBy.email}
                            </dd>
                          </div>
                        )}
                        {entry.reason && (
                          <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">Reason</dt>
                            <dd className="govuk-summary-list__value">{entry.reason}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="govuk-button govuk-!-margin-top-6"
              onClick={() => navigate(`/${appType}/${applicationId}/task-list`)}
            >
              Back to task list
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssignmentHistoryPage;
