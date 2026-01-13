import React from 'react';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import PaginationComponent from './PaginationComponent';

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
  // const handleExportCSV = () => {
  //   const csvData = pendingRequests.map(request => ({
  //     'Name': `${request.first_name} ${request.last_name}`,
  //     'Organisation': request.organisation_name || 'N/A',
  //     'Email': request.email,
  //     'Requested on': new Date(request.requested_at).toLocaleDateString('en-GB', { 
  //       day: '2-digit', 
  //       month: 'long', 
  //       year: 'numeric' 
  //     })
  //   }));

  //   const headers = Object.keys(csvData[0]).join(',');
  //   const rows = csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
  //   const csv = [headers, ...rows].join('\n');

  //   const blob = new Blob([csv], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `pending-access-requests-${new Date().toISOString().split('T')[0]}.csv`;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   window.URL.revokeObjectURL(url);
  // };

  return (
    <div className="govuk-tabs__panel" id="pending-requests">
      <h2 className="govuk-heading-m">Pending access requests</h2>
      
      <div className="govuk-grid-row govuk-!-margin-bottom-4">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">{pendingRequests.length} results</p>
        </div>
        {/* <div className="govuk-grid-column-one-third" style={{ textAlign: 'right' }}>
          {pendingRequests.length > 0 && (
            <button 
              className="govuk-button" 
              data-module="govuk-button"
              onClick={handleExportCSV}
              style={{ backgroundColor: '#00703c' }}
            >
              Download all (CSV)
            </button>
          )}
        </div> */}
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
          <table className="govuk-table">
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

          {totalPages > 1 && (
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};