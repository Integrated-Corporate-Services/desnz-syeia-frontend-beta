import React from 'react';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import PaginationComponent from './PaginationComponent';
import "../../../styles/DashboardMobile.css";
import { PENDING_REQUESTS_TAB_CONSTANTS, ADMIN_COMMON_CONSTANTS } from '../constants/userManagementConstants';

interface AccessRequest {
  access_request_id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation_id: string;
  organisation_name?: string;
  is_agent: boolean;
  requested_at: string;
}

interface PendingRequestsTabProps {
  pendingRequests: AccessRequest[];
  requestsError: string;
  requestsLoading: boolean;
  paginatedRequests: AccessRequest[];
  navigateToReviewRequest: (id: string, organisationId: string) => void;
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
  const heading = PENDING_REQUESTS_TAB_CONSTANTS.HEADING;
  const emptyMessage = PENDING_REQUESTS_TAB_CONSTANTS.EMPTY_MESSAGE;
  return (
    <div className="govuk-tabs__panel">
      <h2 className="govuk-heading-m">{heading}</h2>
      
      <div className="govuk-grid-row govuk-!-margin-bottom-4">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body" role="status">{PENDING_REQUESTS_TAB_CONSTANTS.RESULTS(pendingRequests.length)}</p>
        </div>
      </div>

      {requestsError && (
        <div className="govuk-error-summary" aria-labelledby="pending-requests-error-summary-title" role="alert" tabIndex={-1}>
          <h2 className="govuk-error-summary__title" id="pending-requests-error-summary-title">
            {ADMIN_COMMON_CONSTANTS.ERROR_SUMMARY_TITLE}
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
                <th scope="col" className="govuk-table__header">{PENDING_REQUESTS_TAB_CONSTANTS.TABLE_HEADERS.NAME}</th>
                <th scope="col" className="govuk-table__header">{PENDING_REQUESTS_TAB_CONSTANTS.TABLE_HEADERS.ORGANISATION}</th>
                <th scope="col" className="govuk-table__header">{PENDING_REQUESTS_TAB_CONSTANTS.TABLE_HEADERS.EMAIL}</th>
                <th scope="col" className="govuk-table__header">{PENDING_REQUESTS_TAB_CONSTANTS.TABLE_HEADERS.REQUESTED_ON}</th>
                <th scope="col" className="govuk-table__header">{PENDING_REQUESTS_TAB_CONSTANTS.TABLE_HEADERS.ACTIONS}</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {paginatedRequests.length === 0 ? (
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell" colSpan={5}>
                    <p className="govuk-body">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((request) => (
                  <tr key={`${request.access_request_id}-${request.organisation_id}`} className="govuk-table__row">
                    <td className="govuk-table__cell">
                      <strong>{request.first_name} {request.last_name}</strong>
                    </td>
                    <td className="govuk-table__cell">
                      {request.organisation_name || ADMIN_COMMON_CONSTANTS.NOT_APPLICABLE}
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
                          navigateToReviewRequest(request.access_request_id, request.organisation_id);
                        }}
                      >
                        {PENDING_REQUESTS_TAB_CONSTANTS.REVIEW}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile card view */}
          <div className="user-card-list" role="list" aria-label={PENDING_REQUESTS_TAB_CONSTANTS.LIST_ARIA_LABEL}>
            {paginatedRequests.length === 0 ? (
              <p className="govuk-body">{emptyMessage}</p>
            ) : (
              paginatedRequests.map((request) => (
                <div key={`card-${request.access_request_id}-${request.organisation_id}`} className="user-card" role="listitem">
                  <div className="user-card__header">
                    <div className="user-card__name">{request.first_name} {request.last_name}</div>
                    <div className="user-card__status">
                      <strong className="govuk-tag govuk-tag--yellow">{PENDING_REQUESTS_TAB_CONSTANTS.PENDING}</strong>
                    </div>
                  </div>
                  <div className="user-card__body">
                    <div className="user-card__row">
                      <span className="user-card__label">{PENDING_REQUESTS_TAB_CONSTANTS.CARD_LABELS.ORGANISATION}</span>
                      <span className="user-card__value">{request.organisation_name || ADMIN_COMMON_CONSTANTS.NOT_APPLICABLE}</span>
                    </div>
                    <div className="user-card__row">
                      <span className="user-card__label">{PENDING_REQUESTS_TAB_CONSTANTS.CARD_LABELS.EMAIL}</span>
                      <span className="user-card__value">{request.email}</span>
                    </div>
                    <div className="user-card__row">
                      <span className="user-card__label">{PENDING_REQUESTS_TAB_CONSTANTS.CARD_LABELS.REQUESTED_ON}</span>
                      <span className="user-card__value">{formatDate(request.requested_at)}</span>
                    </div>
                  </div>
                  <div className="user-card__action">
                    <a
                      className="govuk-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToReviewRequest(request.access_request_id, request.organisation_id);
                      }}
                    >
                      {PENDING_REQUESTS_TAB_CONSTANTS.REVIEW}
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