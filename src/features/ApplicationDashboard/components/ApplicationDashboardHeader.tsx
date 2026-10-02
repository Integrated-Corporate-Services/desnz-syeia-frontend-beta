import React from "react";
import "../../../styles/ApplicationDashboard.css";
import "../../../styles/DashboardMobile.css";

interface ApplicationDashboardHeaderProps {
  onToggleFilters: () => void;
  showFilters: boolean;
  onStartNewApplication: () => void;
  canStartNewApplication?: boolean;
}

export const ApplicationDashboardHeader: React.FC<ApplicationDashboardHeaderProps> = ({
  onToggleFilters,
  showFilters,
  onStartNewApplication,
  canStartNewApplication = true,
}) => {
  return (
    <>
      <h1 className="govuk-heading-l">Your applications</h1>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            This dashboard shows you all the applications for your organisation.
            {canStartNewApplication
              ? "Start a new application or use the filters to search for any existing applications."
              : "Use the filters to search for any existing applications."}
          </p>
        </div>
      </div>

      <div className="application-dashboard-header-buttons">
        {canStartNewApplication && (
          <button
            className="govuk-button"
            data-module="govuk-button"
            onClick={onStartNewApplication}
          >
            Start new application
          </button>
        )}
        <button
          className="govuk-button govuk-button--secondary"
          data-module="govuk-button"
          onClick={onToggleFilters}
          aria-expanded={showFilters}
          aria-controls="filterPanel"
        >
          {showFilters ? "Hide search and filter" : "Show search and filter"}
        </button>
      </div>
    </>
  );
};
