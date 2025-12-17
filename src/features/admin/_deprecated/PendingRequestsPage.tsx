import React from 'react';
import { usePendingRequests, usePendingRequestsNavigation } from '../../hooks';
import ErrorSummary from '../../components/commonFormFields/ErrorSummary';
import { RequestFilters, ResultsSummary } from '../../components/shared/RequestFilters';
import { PendingRequestsTable, EmptyState } from '../../components/shared/PendingRequestsTable';

const PendingRequestsPage: React.FC = () => {
  const {
    requests,
    filteredRequests,
    loading,
    error,
    filters,
    updateFilter
  } = usePendingRequests();

  const {
    navigateToDashboard,
    navigateToWorkbasket,
    navigateToReviewRequest
  } = usePendingRequestsNavigation();

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateToDashboard();
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <a
          href="#"
          className="govuk-back-link"
          onClick={handleBackClick}
        >
          Back To Dashboard
        </a>

        <h1 className="govuk-heading-l">Pending access requests</h1>

        {error && (
          <ErrorSummary errors={[{ fieldId: 'general', message: error }]} />
        )}

        {loading ? (
          <div className="govuk-body">
            <p>Loading pending requests...</p>
          </div>
        ) : (
          <>
            <RequestFilters
              filters={filters}
              onFilterChange={updateFilter}
            />

            <ResultsSummary
              filteredCount={filteredRequests.length}
              totalCount={requests.length}
            />

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                {filteredRequests.length === 0 ? (
                  <EmptyState hasRequests={requests.length > 0} />
                ) : (
                  <PendingRequestsTable
                    requests={filteredRequests}
                    onReviewRequest={navigateToReviewRequest}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PendingRequestsPage;
