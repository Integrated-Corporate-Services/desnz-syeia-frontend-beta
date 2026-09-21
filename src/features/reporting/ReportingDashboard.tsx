import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { ROLES } from "../../constants/roles";
import { useAuthUserContext } from "../../context/AuthUserContext";
import type { AuthUser } from "../../types/auth";
import {
  AccessRequestsReport,
  ApplicationsReport,
  FeedbackReport,
  OrganisationBreakdown,
  PaymentsReport,
  RegistrationsReport,
  ReportingSummary,
} from "./components/ReportingSections";
import { ReportingContents, ReportingFilters } from "./components/ReportingControls";
import OperationalTasks from "./components/OperationalTasks";
import { REPORTING_MESSAGES } from "./constants";
import { useReportingDashboard } from "./useReportingDashboard";
import "./ReportingDashboard.css";

type DashboardTab = "reports" | "operational-tasks";

const ReportingDashboard: React.FC = () => {
  const { user } = useAuthUserContext();
  const dashboard = useReportingDashboard();
  const [activeTab, setActiveTab] = useState<DashboardTab>("reports");
  const role = (user as AuthUser | undefined)?.role as string;
  const canViewReporting = [ROLES.SUPERUSER, ROLES.TECH_ADMIN].includes(role);
  const canViewOperationalTasks = role === ROLES.TECH_ADMIN;

  if (!canViewReporting) return <Navigate to="/application-dashboard" replace />;

  const selectedTab = canViewOperationalTasks ? activeTab : "reports";

  const metrics = new Map(
    dashboard.report?.metrics.map((metric) => [metric.key, metric.value]) || []
  );
  const hasReportData = Boolean(
    dashboard.report &&
      (dashboard.report.organisations.length > 0 ||
        dashboard.report.metrics.some((metric) => metric.value > 0))
  );

  return (
    <div className="govuk-grid-row reporting-dashboard">
      <div className="govuk-grid-column-full">
        {canViewOperationalTasks && (
          <nav className="govuk-tabs reporting-dashboard__nav" aria-label="Reporting sections">
            <ul className="govuk-tabs__list">
              <li className={`govuk-tabs__list-item${selectedTab === "reports" ? " govuk-tabs__list-item--selected" : ""}`}>
                <button
                  type="button"
                  className="govuk-tabs__tab reporting-dashboard__tab-button"
                  onClick={() => setActiveTab("reports")}
                >
                  Reports
                </button>
              </li>
              <li className={`govuk-tabs__list-item${selectedTab === "operational-tasks" ? " govuk-tabs__list-item--selected" : ""}`}>
                <button
                  type="button"
                  className="govuk-tabs__tab reporting-dashboard__tab-button"
                  onClick={() => setActiveTab("operational-tasks")}
                >
                  Operational tasks
                </button>
              </li>
            </ul>
          </nav>
        )}

        {selectedTab === "operational-tasks" && <OperationalTasks />}

        {selectedTab === "reports" && (
          <>
            <h1 className="govuk-heading-xl reporting-dashboard__heading">Reporting dashboard</h1>
            <ReportingFilters
              preset={dashboard.preset}
              startDate={dashboard.startDate}
              endDate={dashboard.endDate}
              loading={dashboard.loading}
              availableDateRange={dashboard.availableDateRange}
              availabilityLoaded={dashboard.availabilityLoaded}
              isPresetAvailable={dashboard.isPresetAvailable}
              onPresetChange={dashboard.updatePreset}
              onStartDateChange={dashboard.updateStartDate}
              onEndDateChange={dashboard.updateEndDate}
              onSubmit={() => void dashboard.loadReport()}
            />

            {dashboard.error && (
              dashboard.error === REPORTING_MESSAGES.SNAPSHOTS_UNAVAILABLE ? (
                <p className="govuk-inset-text" role="status">{dashboard.error}</p>
              ) : (
                <div className="govuk-error-summary" role="alert">
                  <h2 className="govuk-error-summary__title">There is a problem</h2>
                  <div className="govuk-error-summary__body"><p>{dashboard.error}</p></div>
                </div>
              )
            )}

            {dashboard.report && !dashboard.loading && !hasReportData && (
              <p className="govuk-inset-text" role="status">
                {REPORTING_MESSAGES.NO_DATA_AVAILABLE}
              </p>
            )}

            {dashboard.report && !dashboard.loading && hasReportData && (
              <div className="govuk-grid-row">
                <ReportingContents />
                <div className="govuk-grid-column-two-thirds reporting-content">
                  <ReportingSummary
                    metrics={metrics}
                    startDate={dashboard.report.startDate}
                    endDate={dashboard.report.endDate}
                    generatedAt={dashboard.report.generatedAt}
                    live={dashboard.report.source === "live"}
                  />
                  <ApplicationsReport metrics={metrics} />
                  <AccessRequestsReport metrics={metrics} organisations={dashboard.report.organisations} />
                  <PaymentsReport metrics={metrics} />
                  <FeedbackReport metrics={metrics} />
                  <RegistrationsReport metrics={metrics} />
                  <OrganisationBreakdown
                    organisations={dashboard.visibleOrganisations}
                    filter={dashboard.organisationFilter}
                    onFilterChange={dashboard.setOrganisationFilter}
                    onDownload={dashboard.downloadCsv}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportingDashboard;

