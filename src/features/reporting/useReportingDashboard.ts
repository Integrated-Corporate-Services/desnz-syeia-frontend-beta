import { useEffect, useState } from "react";
import axios from "axios";
import { getAdminReport, getReportingAvailability } from "../../services/adminReportingService";
import { REPORTING_MESSAGES } from "./constants";
import { downloadOrganisationCsv, getLatestAvailableDateRange, getPresetDates, isDateRangeAvailable } from "./reportingUtils";
import type { AdminReport, DateRangePreset } from "./types";

export const useReportingDashboard = () => {
  const [preset, setPreset] = useState<DateRangePreset>("yesterday");
  const [startDate, setStartDate] = useState(() => getPresetDates("yesterday").startDate);
  const [endDate, setEndDate] = useState(() => getPresetDates("yesterday").endDate);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [organisationFilter, setOrganisationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false);

  const loadReport = async () => {
    if (!startDate || !endDate || endDate < startDate) {
      setReport(null);
      setError(REPORTING_MESSAGES.INVALID_DATE_RANGE);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setReport(await getAdminReport(startDate, endDate));
    } catch (requestError) {
      setReport(null);
      setError(
        axios.isAxiosError(requestError) && requestError.response?.status === 404
          ? REPORTING_MESSAGES.SNAPSHOTS_UNAVAILABLE
          : REPORTING_MESSAGES.LOAD_FAILED
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
    void getReportingAvailability()
      .then((availability) => setAvailableDates(availability.availableDates))
      .then(() => setAvailabilityLoaded(true))
      .catch(() => {
        setAvailableDates([]);
        setAvailabilityLoaded(false);
      });
  }, []);

  const updatePreset = (selectedPreset: DateRangePreset) => {
    setPreset(selectedPreset);
    if (selectedPreset === "available-data") {
      const dates = getLatestAvailableDateRange(availableDates);
      if (dates) {
        setStartDate(dates.startDate);
        setEndDate(dates.endDate);
      }
      return;
    }
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
    availableDates,
    availabilityLoaded,
    availableDateRange: getLatestAvailableDateRange(availableDates),
    isPresetAvailable: (candidatePreset: DateRangePreset) => candidatePreset === "custom" || candidatePreset === "available-data" || (() => {
      const dates = getPresetDates(candidatePreset);
      return isDateRangeAvailable(dates.startDate, dates.endDate, availableDates);
    })(),
  };
};
