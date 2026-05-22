import React from 'react';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import PaginationComponent from './PaginationComponent';
import "../../../styles/DashboardMobile.css";

interface AccessRequest {
  access_request_id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation_name?: string;
  is_agent: boolean;
  requested_at: string;
}

interface PendingRequestsTabProps {
  pendingRequests: AccessRequest[];
  requestsError: string;
  requestsLoading: boolean;
  paginatedRequests: AccessRequest[];
  navigateToReviewRequest: (id: string) => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

export const PendingRequestsTab: React.FC<PendingRequestsTabProps> = ({
  pendingRequests,
  requestsError,
  requestsLoading,
  paginatedRequests,
  navigateToReviewRequest,
  currentPage,
  totalPages,
  handlePageChange
}) => {
  return (
    <div className="govuk-tabs__panel" id="pending-requests">
      <h2 className="govuk-heading-m">Pending access requests</h2>
      
      <div className="govuk-grid-row govuk-!-margin-bottom-4">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">{pendingRequests.length} results</p>
        </div>
      </div>

      {requestsError && (
        <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
          <h2 className="govuk-error-summary__title" id="error-summary-title">
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{requestsError}</p>
          </div>
        </div>
      )}

      {requestsLoading ? (
        <LoadingSkeleton type="table" />
      ) : (
        <>
          {/* Desktop table view */}
          <table className="govuk-table user-management-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">Name</th>
                <th scope="col" className="govuk-table__header">Organisation</th>
                <th scope="col" className="govuk-table__header">Email</th>
                <th scope="col" className="govuk-table__header">Requested on</th>
                <th scope="col" className="govuk-table__header">Action(s)</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {paginatedRequests.length === 0 ? (
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell" colSpan={5}>
                    <p className="govuk-body">No pending access requests.</p>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((request) => (
                  <tr key={request.access_request_id} className="govuk-table__row">
                    <td className="govuk-table__cell">
                      <strong>{request.first_name} {request.last_name}</strong>
                    </td>
                    <td className="govuk-table__cell">
                      {request.organisation_name || 'N/A'}
                    </td>
                    <td className="govuk-table__cell">
                      {request.email}
                    </td>
                    <td className="govuk-table__cell">
                      {new Date(request.requested_at).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="govuk-table__cell">
                      <a
                        className="govuk-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToReviewRequest(request.access_request_id);
                        }}
                      >
                        Review
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile card view */}
          <div className="user-card-list" role="list" aria-label="Pending requests list">
            {paginatedRequests.length === 0 ? (
              <p className="govuk-body">No pending access requests.</p>
            ) : (
              paginatedRequests.map((request) => (
                <div key={`card-${request.access_request_id}`} className="user-card" role="listitem">
                  <div className="user-card__header">
                    <div className="user-card__name">{request.first_name} {request.last_name}</div>
                    <div className="user-card__status">
                      <strong className="govuk-tag govuk-tag--yellow">Pending</strong>
                    </div>
                  </div>
                  <div className="user-card__body">
                    <div className="user-card__row">
                      <span className="user-card__label">Organisation: </span>
                      <span className="user-card__value">{request.organisation_name || 'N/A'}</span>
                    </div>
                    <div className="user-card__row">
                      <span className="user-card__label">Email: </span>
                      <span className="user-card__value">{request.email}</span>
                    </div>
                    <div className="user-card__row">
                      <span className="user-card__label">Requested on: </span>
                      <span className="user-card__value">{formatDate(request.requested_at)}</span>
                    </div>
                  </div>
                  <div className="user-card__action">
                    <a
                      className="govuk-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToReviewRequest(request.access_request_id);
                      }}
                    >
                      Review
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="app-pagination-container govuk-!-margin-top-6">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};