import { useState, useEffect, useCallback } from "react";
import { parishService } from "../services/parishService";
import { Lpa } from "../components/LpaSelector";
import log from "../logger";

interface UseDerivedLpasReturn {
  derivedLpas: Lpa[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching LPAs derived from application parishes
 *
 * Features:
 * - Fetches derived LPAs on mount when applicationId is available
 * - Manages loading and error states
 * - Provides refetch capability
 * - Logs fetch operations
 */
export const useDerivedLpas = (
  applicationId: string | undefined
): UseDerivedLpasReturn => {
  const [derivedLpas, setDerivedLpas] = useState<Lpa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDerivedLpas = useCallback(async () => {
    if (!applicationId) {
      setDerivedLpas([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const lpas = await parishService.fetchDerivedLpas(applicationId);
      log.debug("Derived LPAs from parishes:", lpas);
      setDerivedLpas(lpas);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch derived LPAs";
      log.error("Failed to fetch derived LPAs:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchDerivedLpas();
  }, [fetchDerivedLpas]);

  return {
    derivedLpas,
    loading,
    error,
    refetch: fetchDerivedLpas,
  };
};
