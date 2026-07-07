import { useState, useEffect, useCallback } from "react";
import { lpaService, Lpa } from "../services/lpaService";

interface UseLpasReturn {
  lpas: Lpa[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  findLpaByCode: (code: string) => Lpa | undefined;
}

/**
 * Custom hook for managing LPA data
 *
 * Features:
 * - Fetches LPAs on mount
 * - Manages loading and error states
 * - Provides refetch capability
 * - Helper to find LPA by code
 */
export const useLpas = (): UseLpasReturn => {
  const [lpas, setLpas] = useState<Lpa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLpas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await lpaService.getAllLpas();
      setLpas(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load local planning authorities. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLpas();
  }, [fetchLpas]);

  const findLpaByCode = useCallback(
    (code: string) => lpas.find((lpa) => lpa.lpa_code === code),
    [lpas]
  );

  return {
    lpas,
    loading,
    error,
    refetch: fetchLpas,
    findLpaByCode,
  };
};
