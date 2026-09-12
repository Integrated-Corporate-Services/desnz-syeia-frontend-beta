import { useEffect, useState } from "react";
import { getSubmittedApplicationsSummary } from "../../../services/adminReportingService";
import type { SubmittedApplicationsSummary } from "../types";
import { SUBMITTED_APPLICATIONS_MESSAGES, SUBMITTED_APPLICATIONS_PAGE_SIZE } from "../constants";

export const useSubmittedApplicationsSummary = () => {
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState<SubmittedApplicationsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = async (pageToLoad: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSubmittedApplicationsSummary(pageToLoad, SUBMITTED_APPLICATIONS_PAGE_SIZE);
      setSummary(result);
      setPage(pageToLoad);
    } catch {
      setError(SUBMITTED_APPLICATIONS_MESSAGES.LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = summary ? Math.max(1, Math.ceil(summary.total / SUBMITTED_APPLICATIONS_PAGE_SIZE)) : 1;

  return {
    summary,
    loading,
    error,
    page,
    totalPages,
    goToPage: (nextPage: number) => void loadPage(nextPage),
  };
};
