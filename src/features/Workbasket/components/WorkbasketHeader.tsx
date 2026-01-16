import React from "react";

interface WorkbasketHeaderProps {
  onToggleFilters: () => void;
  showFilters: boolean;
  onStartNewApplication: () => void;
}

export const WorkbasketHeader: React.FC<WorkbasketHeaderProps> = ({
  onToggleFilters,
  showFilters,
  onStartNewApplication,
}) => {
  return (
    <>
      <h1 className="govuk-heading-xl">Your applications</h1>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            This dashboard shows you all the applications for your organisation.
            Start a new application or use the filters to search for any
            existing applications.
          </p>
        </div>
      </div>

      <button
        className="govuk-button govuk-!-margin-bottom-6"
        data-module="govuk-button"
        onClick={onStartNewApplication}
      >
        Start new application
      </button>

      <details className="govuk-details" open={showFilters}>
        <summary
          className="govuk-details__summary"
          onClick={(e) => {
            e.preventDefault();
            onToggleFilters();
          }}
        >
          <span className="govuk-details__summary-text">
            {showFilters ? "Hide search and filter" : "Show search and filter"}
          </span>
        </summary>
      </details>
    </>
  );
};
