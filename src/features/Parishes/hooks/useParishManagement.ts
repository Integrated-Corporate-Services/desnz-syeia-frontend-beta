import { useState, useCallback, useEffect } from "react";
import { Parish } from "../types/Parish";
import { parishService } from "../../../services/parishService";

export const useParishManagement = (applicationId: string) => {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch saved parishes on mount
  useEffect(() => {
    const fetchSavedParishes = async () => {
      if (!applicationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        const response = await parishService.fetchParishes(applicationId);

        // Transform API response to Parish type
        const savedParishes: Parish[] =
          response.parishes?.map((p: any) => ({
            id: p.parish_code,
            name: p.parish_name,
            county: p.country,
          })) || [];

        setParishes(savedParishes);
      } catch (_error) {
        setLoadError("Failed to load saved parishes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedParishes();
  }, [applicationId]);

  const addParish = useCallback((parish: Parish) => {
    setParishes((current) => {
      if (current.find((p) => p.id === parish.id)) {
        return current;
      }
      return [...current, parish];
    });
  }, []);

  const removeParish = useCallback((parishId: string) => {
    setParishes((current) => current.filter((p) => p.id !== parishId));
  }, []);

  return {
    parishes,
    addParish,
    removeParish,
    isLoading,
    loadError,
  };
};
