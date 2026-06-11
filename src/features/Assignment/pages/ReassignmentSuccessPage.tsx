/**
 * Reassignment Success Page
 * Confirmation page after successful reassignment
 * Created: 2026-06-09
 */

import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export const ReassignmentSuccessPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract base path (e.g., /s-37, /nwl, /tlp)
  const basePath = location.pathname.split('/').slice(0, 2).join('/');

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">
                Application reassigned
              </h1>
              <div className="govuk-panel__body">
                The assigned editor has been changed successfully
              </div>
            </div>

            <p className="govuk-body">
              The new editor will now be able to edit and submit this application.
            </p>

            <h2 className="govuk-heading-m">What happens next</h2>
            <p className="govuk-body">
              The assigned editor will see this application in their task list. 
              You can view the assignment history to see all editor changes.
            </p>

            <p className="govuk-body">
              <a
                href={`${basePath}/${applicationId}/assignment-history`}
                className="govuk-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`${basePath}/${applicationId}/assignment-history`);
                }}
              >
                View assignment history
              </a>
            </p>

            <button
              className="govuk-button govuk-!-margin-top-4"
              data-module="govuk-button"
              onClick={() => navigate(`${basePath}/${applicationId}/task-list`)}
            >
              Return to application
            </button>
            
            <button
              className="govuk-button govuk-button--secondary govuk-!-margin-left-3 govuk-!-margin-top-4"
              onClick={() => navigate('/applications')}
            >
              View all applications
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReassignmentSuccessPage;
