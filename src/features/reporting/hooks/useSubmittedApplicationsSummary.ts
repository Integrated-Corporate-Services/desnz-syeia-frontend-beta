import { useEffect, useState } from "react";
import { getSubmittedApplicationsSummary } from "../../../services/adminReportingService";
import type { SubmittedApplicationsSummary } from "../types";
import { SUBMITTED_APPLICATIONS_MESSAGES, SUBMITTED_APPLICATIONS_PAGE_SIZE } from "../constants";

export const useSubmittedApplicationsSummary = () => {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedDateFilter, setAppliedDateFilter] = useState<{ startDate: string; endDate: string }>({ startDate: "", endDate: "" });
  const [summary, setSummary] = useState<SubmittedApplicationsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = async (pageToLoad: number, dateFilter: { startDate: string; endDate: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSubmittedApplicationsSummary(
        pageToLoad,
        SUBMITTED_APPLICATIONS_PAGE_SIZE,
        dateFilter.startDate,
        dateFilter.endDate
      );
      setSummary(result);
      setPage(pageToLoad);
    } catch {
      setError(SUBMITTED_APPLICATIONS_MESSAGES.LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPage(1, appliedDateFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = summary ? Math.max(1, Math.ceil(summary.total / SUBMITTED_APPLICATIONS_PAGE_SIZE)) : 1;

  const applyDateFilter = () => {
    const dateFilter = { startDate, endDate };
    setAppliedDateFilter(dateFilter);
    void loadPage(1, dateFilter);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setAppliedDateFilter({ startDate: "", endDate: "" });
    void loadPage(1, { startDate: "", endDate: "" });
  };

  return {
    summary,
    loading,
    error,
    page,
    totalPages,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isDateFilterApplied: !!(appliedDateFilter.startDate || appliedDateFilter.endDate),
    applyDateFilter,
    clearDateFilter,
    goToPage: (nextPage: number) => void loadPage(nextPage, appliedDateFilter),
  };
};
