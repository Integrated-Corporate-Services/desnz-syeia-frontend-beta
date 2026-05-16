import { useEffect, useState } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import { getObjectorDetails } from '../services';
import type { ObjectorDetails } from '../types';

/**
 * Hook to fetch objector details for NWL application
 * Does NOT depend on application store - uses direct API call
 */
export const useObjectorDetailsData = () => {
  const appId = useGetApplicationId();
  const [objectorDetails, setObjectorDetails] = useState<ObjectorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchObjectorDetails = async () => {
      if (!appId) {
        setIsLoading(false);
        return;
      }

      console.log('[useObjectorDetailsData] Fetching objector details for appId:', appId);
      setIsLoading(true);
      setError(null);

      try {
        const data = await getObjectorDetails(appId);
        console.log('[useObjectorDetailsData] Received data:', data);
        setObjectorDetails(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load objector details';
        console.error('[useObjectorDetailsData] Error:', errorMessage, err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchObjectorDetails();
  }, [appId]);

  return {
    appId,
    objectorDetails,
    isLoading,
    error,
  };
};
