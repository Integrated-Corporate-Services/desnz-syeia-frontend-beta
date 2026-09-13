import React from "react";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { formatDateTime, formatNumber } from "../reportingUtils";
import { SUBMITTED_APPLICATIONS_MESSAGES } from "../constants";
import { useSubmittedApplicationsSummary } from "../hooks/useSubmittedApplicationsSummary";

interface SubmittedApplicationsSummaryProps {
  onViewApplication: (reference: string) => void;
}

const SubmittedApplicationsSummary: React.FC<SubmittedApplicationsSummaryProps> = ({ onViewApplication }) => {
  const {
    summary,
    loading,
    error,
    page,
    totalPages,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isDateFilterApplied,
    applyDateFilter,
    clearDateFilter,
    goToPage,
  } = useSubmittedApplicationsSummary();

  const dateFilter = (
    <form
      className="reporting-filter-panel"
      onSubmit={(event) => {
        event.preventDefault();
        applyDateFilter();
      }}
    >
      <fieldset className="govuk-fieldset">
        <legend className="govuk-visually-hidden">Filter submitted applications by date</legend>
        <div className="reporting-filter-row">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="submitted-applications-start-date">Submitted from</label>
            <input
              className="govuk-input reporting-date-input"
              id="submitted-applications-start-date"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="submitted-applications-end-date">Submitted to</label>
            <input
              className="govuk-input reporting-date-input"
              id="submitted-applications-end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <button className="govuk-button reporting-filter-button" type="submit" disabled={loading}>
            {loading ? "Loading" : "Apply filter"}
          </button>
          {isDateFilterApplied && (
            <button
              className="govuk-button govuk-button--secondary reporting-filter-button"
              type="button"
              disabled={loading}
              onClick={clearDateFilter}
            >
              Clear filter
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );

  if (loading && !summary) {
    return (
      <div className="submitted-applications-summary">
        {dateFilter}
        <p className="govuk-body">Loading submitted applications…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submitted-applications-summary">
        {dateFilter}
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!summary || summary.total === 0) {
    return (
      <div className="submitted-applications-summary">
        {dateFilter}
        <p className="govuk-inset-text">{SUBMITTED_APPLICATIONS_MESSAGES.NO_APPLICATIONS}</p>
      </div>
    );
  }

  return (
    <div className="submitted-applications-summary">
      {dateFilter}

      <div className="govuk-panel govuk-panel--confirmation submitted-applications-summary__panel">
        <div className="govuk-panel__title">{formatNumber.format(summary.total)}</div>
        <div className="govuk-panel__body">applications submitted{isDateFilterApplied ? " in this date range" : ""}</div>
      </div>

      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-table__caption--m govuk-visually-hidden">
          Submitted applications
        </caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th className="govuk-table__header" scope="col">DESNZ reference</th>
            <th className="govuk-table__header" scope="col">Type</th>
            <th className="govuk-table__header" scope="col">Status</th>
            <th className="govuk-table__header" scope="col">Submitted</th>
            <th className="govuk-table__header" scope="col">Organisation</th>
            <th className="govuk-table__header" scope="col"><span className="govuk-visually-hidden">Action</span></th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {summary.applications.map((application) => (
            <tr className="govuk-table__row" key={application.applicationId}>
              <td className="govuk-table__cell">{application.desnzRef || "Not available"}</td>
              <td className="govuk-table__cell">{application.applicationType}</td>
              <td className="govuk-table__cell">
                <StatusBadge status={application.applicationStatus} />
              </td>
              <td className="govuk-table__cell">{formatDateTime(application.submittedAt)}</td>
              <td className="govuk-table__cell">{application.organisationName || "Not available"}</td>
              <td className="govuk-table__cell">
                <button
                  type="button"
                  className="govuk-link govuk-link--no-visited-state submitted-applications-summary__view-link"
                  onClick={() => onViewApplication(application.desnzRef || application.applicationId)}
                >
                  View<span className="govuk-visually-hidden"> {application.desnzRef}</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <nav className="govuk-pagination" aria-label="Submitted applications pages">
          <div className="govuk-pagination__prev">
            {page > 1 && (
              <button
                type="button"
                className="govuk-link govuk-pagination__link submitted-applications-summary__page-button"
                onClick={() => goToPage(page - 1)}
              >
                <span className="govuk-pagination__link-title">Previous</span>
              </button>
            )}
          </div>
          <p className="govuk-body submitted-applications-summary__page-count">
            Page {page} of {totalPages}
          </p>
          <div className="govuk-pagination__next">
            {page < totalPages && (
              <button
                type="button"
                className="govuk-link govuk-pagination__link submitted-applications-summary__page-button"
                onClick={() => goToPage(page + 1)}
              >
                <span className="govuk-pagination__link-title">Next</span>
              </button>
            )}
          </div>
        </nav>
      )}
    </div>
  );
};

export default SubmittedApplicationsSummary;
