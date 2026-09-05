import { useEffect, useState } from "react";
import { getAdminReport } from "../../services/adminReportingService";
import { REPORTING_MESSAGES } from "./constants";
import { downloadOrganisationCsv, getPresetDates } from "./reportingUtils";
import type { AdminReport, DateRangePreset } from "./types";

export const useReportingDashboard = () => {
  const [preset, setPreset] = useState<DateRangePreset>("yesterday");
  const [startDate, setStartDate] = useState(() => getPresetDates("yesterday").startDate);
  const [endDate, setEndDate] = useState(() => getPresetDates("yesterday").endDate);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [organisationFilter, setOrganisationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await getAdminReport(startDate, endDate));
    } catch {
      setReport(null);
      setError(REPORTING_MESSAGES.LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  const updatePreset = (selectedPreset: DateRangePreset) => {
    setPreset(selectedPreset);
    if (selectedPreset !== "custom") {
      const dates = getPresetDates(selectedPreset);
      setStartDate(dates.startDate);
      setEndDate(dates.endDate);
    }
  };

  const updateStartDate = (value: string) => {
    setPreset("custom");
    setStartDate(value);
  };

  const updateEndDate = (value: string) => {
    setPreset("custom");
    setEndDate(value);
  };

  const downloadCsv = () => {
    if (report) downloadOrganisationCsv(report.organisations, startDate, endDate);
  };

  const visibleOrganisations = (report?.organisations || []).filter((organisation) =>
    organisation.organisationName.toLowerCase().includes(organisationFilter.trim().toLowerCase())
  );

  return {
    preset,
    startDate,
    endDate,
    report,
    organisationFilter,
    visibleOrganisations,
    loading,
    error,
    loadReport,
    updatePreset,
    updateStartDate,
    updateEndDate,
    setOrganisationFilter,
    downloadCsv,
  };
};
