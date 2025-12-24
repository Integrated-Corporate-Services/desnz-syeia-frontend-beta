import React from 'react';
import { formatDate } from '../../utils/formatters';

interface AccessRequest {
  access_request_id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation_name?: string;
  is_agent: boolean;
  requested_at: string;
}

interface PendingRequestsTableProps {
  requests: AccessRequest[];
  onReviewRequest: (requestId: string) => void;
}

export const PendingRequestsTable: React.FC<PendingRequestsTableProps> = ({
  requests,
  onReviewRequest
}) => {
  if (requests.length === 0) {
    return (
      <div className="govuk-inset-text">
        No access requests match your filters.
      </div>
    );
  }

  const handleReviewClick = (e: React.MouseEvent<HTMLAnchorElement>, requestId: string) => {
    e.preventDefault();
    onReviewRequest(requestId);
  };

  return (
    <table className="govuk-table govuk-!-margin-bottom-6">
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th scope="col" className="govuk-table__header">Name</th>
          <th scope="col" className="govuk-table__header">Organisation</th>
          <th scope="col" className="govuk-table__header">Requested on</th>
          <th scope="col" className="govuk-table__header">Applicant type</th>
          <th scope="col" className="govuk-table__header">Action</th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {requests.map((request) => (
          <tr key={request.access_request_id} className="govuk-table__row">
            <td className="govuk-table__cell">
              <strong>{request.first_name} {request.last_name}</strong>
            </td>
            <td className="govuk-table__cell">
              {request.organisation_name || 'N/A'}
            </td>
            <td className="govuk-table__cell">
              {formatDate(request.requested_at)}
            </td>
            <td className="govuk-table__cell">
              {/* TODO: Replace inline styles with GOV.UK Design System tag modifiers */}
              <strong
                className="govuk-tag"
                style={{
                  backgroundColor: !request.is_agent ? '#1d70b8' : '#505a5f',
                  color: '#ffffff'
                }}
              >
                {!request.is_agent ? 'EMPLOYEE' : 'AGENT'}
              </strong>
            </td>
            <td className="govuk-table__cell">
              <a
                href="#"
                className="govuk-link govuk-!-font-weight-bold"
                onClick={(e) => handleReviewClick(e, request.access_request_id)}
              >
                Review
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

interface EmptyStateProps {
  hasRequests: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasRequests }) => (
  <div className="govuk-inset-text">
    {hasRequests
      ? "No access requests match your filters."
      : "No pending access requests."
    }
  </div>
);
