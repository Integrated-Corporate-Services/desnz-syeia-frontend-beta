import React from "react";
import "../../../styles/Workbasket.css";

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

      <div className="workbasket-header-buttons">
        <button
          className="govuk-button"
          data-module="govuk-button"
          onClick={onStartNewApplication}
        >
          Start new application
        </button>
        <button
          className="govuk-button govuk-button--secondary"
          data-module="govuk-button"
          onClick={onToggleFilters}
          aria-expanded={showFilters}
          aria-controls="workbasket-filters"
        >
          {showFilters ? "Hide search and filter" : "Show search and filter"}
        </button>
      </div>
    </>
  );
};
