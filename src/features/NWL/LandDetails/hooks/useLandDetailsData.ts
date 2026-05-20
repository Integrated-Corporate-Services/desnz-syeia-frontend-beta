import { useState, useEffect } from 'react';
import { LandDetails } from '../types';
import { getLandDetails } from '../services/landDetailsService';

/**
 * Hook to fetch land details for NWL application
 * Follows the same pattern as objector details
 * Pages should use service functions directly for updates
 */
export const useLandDetailsData = (applicationId: string) => {
  const [landDetails, setLandDetails] = useState<LandDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLandDetails = async () => {
      if (!applicationId) {
        setIsLoading(false);
        return;
      }

      console.log('[useLandDetailsData] Fetching land details for appId:', applicationId);
      setIsLoading(true);
      setError(null);

      try {
        const data = await getLandDetails(applicationId);
        console.log('[useLandDetailsData] Received data:', data);
        setLandDetails(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load land details';
        console.error('[useLandDetailsData] Error:', errorMessage, err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandDetails();
  }, [applicationId]);

  return {
    landDetails,
    isLoading,
    error,
  };
};
