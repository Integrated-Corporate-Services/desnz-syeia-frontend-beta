import React, { useState } from "react";
import axios from "axios";
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
import { REPORTING_MESSAGES } from "./constants";
import { useReportingDashboard } from "./useReportingDashboard";
import { createReportingJob } from '../../services/adminReportingService';
import "./ReportingDashboard.css";

const ReportingDashboard: React.FC = () => {
  const { user } = useAuthUserContext();
  const dashboard = useReportingDashboard();
  const [jobMessage, setJobMessage] = useState<string | null>(null);
  const [startingJob, setStartingJob] = useState(false);
  const isTechAdminRole = (user as AuthUser | undefined)?.role === ROLES.TECH_ADMIN;
  const isTechAdmin = [ROLES.DESNZ_ADMIN, ROLES.TECH_ADMIN].includes(
    (user as AuthUser | undefined)?.role as string
  );

  if (!isTechAdmin) return <Navigate to="/application-dashboard" replace />;

  const metrics = new Map(
    dashboard.report?.metrics.map((metric) => [metric.key, metric.value]) || []
  );
  const hasReportData = Boolean(
    dashboard.report &&
      (dashboard.report.organisations.length > 0 ||
        dashboard.report.metrics.some((metric) => metric.value > 0))
  );

  const generateReport = async () => {
    setStartingJob(true);
    setJobMessage(null);
    try {
      const job = await createReportingJob(dashboard.startDate, dashboard.endDate);
      setJobMessage(`Report generation is ${job.status.toLowerCase()} for ${job.startDate} to ${job.endDate}.`);
    } catch (error) {
      setJobMessage(
        axios.isAxiosError(error) && error.response?.status === 409
          ? String(error.response.data?.error || 'Report generation is already complete or in progress for this date range.')
          : 'Report generation could not be started. Try again shortly.'
      );
    } finally {
      setStartingJob(false);
    }
  };

  return (
    <div className="govuk-grid-row reporting-dashboard">
      <div className="govuk-grid-column-full">
        <h1 className="govuk-heading-xl">Reporting dashboard</h1>
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

        {isTechAdminRole && (
          <div className="reporting-job-control">
            <button className="govuk-button govuk-button--secondary" type="button" onClick={() => void generateReport()} disabled={startingJob || !dashboard.startDate || !dashboard.endDate || dashboard.endDate < dashboard.startDate}>
              {startingJob ? 'Starting report generation' : 'Generate report data'}
            </button>
            {jobMessage && <p className="govuk-hint" role="status">{jobMessage}</p>}
          </div>
        )}

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
