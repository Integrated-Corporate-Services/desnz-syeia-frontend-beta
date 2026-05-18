/**
 * NWL Application Hook
 * Comprehensive hook for accessing complete NWL application data
 */

import { useEffect, useState } from 'react';
import { applicationApiService } from '../../../services/applicationApiService';
import type { Application } from '../../../types/application';

interface UseNWLApplicationResult {
  application: Application | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage complete NWL application data
 * This includes base application + application_details + objector_details
 * 
 * @param applicationId - The application ID to fetch
 * @returns Complete NWL application data with loading and error states
 */
export const useNWLApplication = (applicationId: string | null): UseNWLApplicationResult => {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNWLApplication = async () => {
    if (!applicationId) {
      setIsLoading(false);
      return;
    }

    console.log('[useNWLApplication] Fetching complete NWL application:', applicationId);
    setIsLoading(true);
    setError(null);

    try {
      const data = await applicationApiService.getApplicationById(applicationId);
      console.log('[useNWLApplication] Received complete NWL data:', {
        hasApplicationDetails: !!data.application_details,
        hasObjectorDetails: !!data.objector_details,
      });
      setApplication(data as Application);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load NWL application';
      console.error('[useNWLApplication] Error:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNWLApplication();
  }, [applicationId]);

  return {
    application,
    isLoading,
    error,
    refetch: fetchNWLApplication,
  };
};
