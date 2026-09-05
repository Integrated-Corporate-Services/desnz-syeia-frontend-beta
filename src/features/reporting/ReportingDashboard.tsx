import React from "react";
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
  ReportingSummary,
} from "./components/ReportingSections";
import { ReportingContents, ReportingFilters } from "./components/ReportingControls";
import { useReportingDashboard } from "./useReportingDashboard";
import "./ReportingDashboard.css";

const ReportingDashboard: React.FC = () => {
  const { user } = useAuthUserContext();
  const dashboard = useReportingDashboard();
  const isTechAdmin = [ROLES.DESNZ_ADMIN, ROLES.TECH_ADMIN].includes(
    (user as AuthUser | undefined)?.role as string
  );

  if (!isTechAdmin) return <Navigate to="/application-dashboard" replace />;

  const metrics = new Map(
    dashboard.report?.metrics.map((metric) => [metric.key, metric.value]) || []
  );

  return (
    <div className="govuk-grid-row reporting-dashboard">
      <div className="govuk-grid-column-full">
        <h1 className="govuk-heading-xl">Reporting dashboard</h1>
        <ReportingFilters
          preset={dashboard.preset}
          startDate={dashboard.startDate}
          endDate={dashboard.endDate}
          loading={dashboard.loading}
          onPresetChange={dashboard.updatePreset}
          onStartDateChange={dashboard.updateStartDate}
          onEndDateChange={dashboard.updateEndDate}
          onSubmit={() => void dashboard.loadReport()}
        />

        {dashboard.error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body"><p>{dashboard.error}</p></div>
          </div>
        )}

        {dashboard.report && !dashboard.loading && (
          <div className="govuk-grid-row">
            <ReportingContents />
            <div className="govuk-grid-column-two-thirds reporting-content">
              <ReportingSummary
                metrics={metrics}
                startDate={dashboard.report.startDate}
                endDate={dashboard.report.endDate}
              />
              <ApplicationsReport metrics={metrics} />
              <AccessRequestsReport metrics={metrics} />
              <PaymentsReport metrics={metrics} />
              <FeedbackReport metrics={metrics} />
              <OrganisationBreakdown
                organisations={dashboard.visibleOrganisations}
                filter={dashboard.organisationFilter}
                onFilterChange={dashboard.setOrganisationFilter}
                onDownload={dashboard.downloadCsv}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportingDashboard;
