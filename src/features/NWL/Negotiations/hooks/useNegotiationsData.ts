import { useEffect, useState, useCallback } from 'react';
import { useApplicationStore } from '../../../../store/useApplicationStore';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import { getNegotiationsData } from '../services';
import { NegotiationsData } from '../types';

export const useNegotiationsData = () => {
  const appId = useGetApplicationId();
  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );
  
  const [negotiationsData, setNegotiationsData] = useState<NegotiationsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch negotiations data directly from dedicated endpoint
  const fetchNegotiationsData = useCallback(async () => {
    if (!appId) {
      console.log('[useNegotiationsData] No appId, skipping fetch');
      return;
    }
    
    console.log('[useNegotiationsData] Fetching negotiations data for appId:', appId);
    setIsLoading(true);
    try {
      const data = await getNegotiationsData(appId);
      console.log('[useNegotiationsData] Fetched data:', {
        hasData: !!data,
        has_negotiations: data?.has_negotiations,
        negotiations_comments: data?.negotiations_comments,
        no_negotiations_reason: data?.no_negotiations_reason,
        uploaded_files_count: data?.uploaded_files?.length || 0,
        application_documents_count: data?.application_documents?.length || 0,
      });
      setNegotiationsData(data);
    } catch (error) {
      console.error('[useNegotiationsData] Error fetching negotiations data:', error);
      setNegotiationsData(null);
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  // Initial fetch of application and negotiations data
  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
      fetchNegotiationsData();
    }
  }, [appId, fetchAndSetApplication, fetchNegotiationsData]);

  return {
    appId,
    application,
    negotiationsData,
    isLoading,
    refetchNegotiationsData: fetchNegotiationsData,
  };
};
