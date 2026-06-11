/**
 * Assigned Editor Banner Component
 * Shows who is currently assigned to edit a draft application
 * Redesigned following GOV.UK Design System best practices
 * Created: 2026-06-09
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AssignedEditor } from '../../../services/assignmentApiService';

interface AssignedEditorBannerProps {
  editor: AssignedEditor | null;
  canReassign: boolean;
  onReassign?: () => void;
  applicationId: string;
}

export const AssignedEditorBanner: React.FC<AssignedEditorBannerProps> = ({
  editor,
  canReassign,
  onReassign,
  applicationId,
}) => {
  const navigate = useNavigate();

  if (!editor) {
    return null;
  }

  const formattedDate = new Date(editor.since).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Extract application type path (s-37, nwl, or tlp) for history link
  const appType = window.location.pathname.split('/')[2]; // Gets 's-37' from '/frontend/s-37/...'
  const historyPath = `/${appType}/${applicationId}/assignment-history`;

  return (
    <div 
      className="govuk-notification-banner govuk-notification-banner--info" 
      role="region" 
      aria-labelledby="assigned-editor-title"
      style={{ borderColor: '#1d70b8' }}
    >
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id="assigned-editor-title">
          Assigned editor
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        {/* Editor info with Change link on same row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
          <div>
            <p className="govuk-body" style={{ marginBottom: '5px' }}>
              <strong className="govuk-!-font-size-19">{editor.fullName || editor.email}</strong>
            </p>
            <p className="govuk-body-s govuk-!-margin-bottom-0" style={{ color: '#505a5f' }}>
              Assigned since {formattedDate}
            </p>
          </div>
          {canReassign && onReassign && (
            <a
              href="#"
              className="govuk-link govuk-!-font-size-19"
              onClick={(e) => {
                e.preventDefault();
                onReassign();
              }}
              style={{ whiteSpace: 'nowrap', marginLeft: '15px' }}
            >
              Change
            </a>
          )}
        </div>

        {/* History link at bottom */}
        <p className="govuk-body-s" style={{ marginTop: '15px', marginBottom: '0' }}>
          <a 
            href="#" 
            className="govuk-link govuk-link--no-visited-state"
            onClick={(e) => {
              e.preventDefault();
              navigate(historyPath);
            }}
          >
            View assignment history
          </a>
        </p>
      </div>
    </div>
  );
};

export default AssignedEditorBanner;
