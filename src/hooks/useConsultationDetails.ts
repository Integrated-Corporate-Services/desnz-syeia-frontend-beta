import { useState, useEffect, useCallback } from "react";
import { fetchConsultationDetails } from "../services/consultationService";
import { ConsultationDetails } from "../types/ConsultationDetails";
import log from "../logger";

interface UseConsultationDetailsReturn {
  consultations: ConsultationDetails[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hardcoded consultations matching backend LPAs
const HARDCODED_CONSULTATIONS: ConsultationDetails[] = [
  
  {
    id: 'nottingham-city-council',
    applicationId: '',
    consultationType: 'organisation',
    consulteeOrganisationId: 'E06000018',
    consulteeOrganisationName: 'Nottingham City Council',
    status: 'Not started yet',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'leicester-city-council',
    applicationId: '',
    consultationType: 'organisation',
    consulteeOrganisationId: 'E06000016',
    consulteeOrganisationName: 'Leicester City Council',
    status: 'Not started yet',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Custom hook for fetching consultation details for an application
 *
 * Features:
 * - Fetches consultations on mount when applicationId and userId are available
 * - Manages loading and error states
 * - Provides refetch capability
 * - Logs fetch operations
 */
export const useConsultationDetails = (
  applicationId: string | undefined,
  userId: string | undefined
): UseConsultationDetailsReturn => {
  const [consultations, setConsultations] = useState<ConsultationDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsultations = useCallback(async () => {
    if (!applicationId || !userId) {
      setConsultations([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      log.debug(
        "Fetching consultation details for applicationId:",
        applicationId,
        "and userId:",
        userId
      );
      const data = await fetchConsultationDetails(applicationId, userId);
       // Merge API data with hardcoded consultations
      const merged = [
        ...HARDCODED_CONSULTATIONS.map(consultation => ({
          ...consultation,
          applicationId: applicationId
        })),
        ...(Array.isArray(data) ? data : [])
      ];
      setConsultations(merged);
      log.debug("Consultation details response:", merged);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch consultation details";
      log.error("Failed to fetch consultation details:", err);
      setError(errorMessage);
      setConsultations(
        HARDCODED_CONSULTATIONS.map(consultation => ({
          ...consultation,
          applicationId: applicationId
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId, userId]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  return {
    consultations,
    loading,
    error,
    refetch: fetchConsultations,
  };
};
