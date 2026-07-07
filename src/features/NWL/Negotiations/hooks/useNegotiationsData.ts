import { useEffect, useState, useCallback, useRef } from 'react';
import { useApplication } from '../../../../hooks/useApplication';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import { getNegotiationsData } from '../services';
import { NegotiationsData } from '../types';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('useNegotiationsData');

export const useNegotiationsData = () => {
  const appId = useGetApplicationId();
  const { application, fetchApplication } = useApplication();
  
  const [negotiationsData, setNegotiationsData] = useState<NegotiationsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetchedOnMount = useRef(false);

  // Fetch negotiations data directly from dedicated endpoint
  const fetchNegotiationsData = useCallback(async () => {
    if (!appId) {
      logger.debug('[useNegotiationsData] No appId, skipping fetch');
      return;
    }
    
    logger.debug('[useNegotiationsData] ===== FETCHING DATA =====');
    logger.debug('[useNegotiationsData] Fetching negotiations data for appId:', appId);
    logger.debug('[useNegotiationsData] API URL:', `/backend/api/nwl/${appId}/negotiations`);
    setIsLoading(true);
    try {
      const data = await getNegotiationsData(appId);
      logger.debug('[useNegotiationsData] Fetched data:', {
        hasData: !!data,
        has_negotiations: data?.has_negotiations,
        negotiations_comments: data?.negotiations_comments,
        no_negotiations_reason: data?.no_negotiations_reason,
        reason_length: data?.no_negotiations_reason?.length || 0,
        uploaded_files_count: data?.uploaded_files?.length || 0,
        application_documents_count: data?.application_documents?.length || 0,
        full_data: JSON.stringify(data, null, 2),
      });
      setNegotiationsData(data);
    } catch (error) {
      logger.error('[useNegotiationsData] Error fetching negotiations data:', error);
      setNegotiationsData(null);
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  // Initial fetch of application and negotiations data
  // CRITICAL FIX: Fetch on every mount when appId becomes available
  useEffect(() => {
    if (appId) {
      logger.debug('[useNegotiationsData] appId available, checking if need to fetch', {
        appId,
        hasFetchedOnMount: hasFetchedOnMount.current,
      });
      
      fetchApplication(appId);
      
      // Always fetch on first render when appId is available
      if (!hasFetchedOnMount.current) {
        logger.debug('[useNegotiationsData] First fetch on this mount, fetching negotiations data');
        hasFetchedOnMount.current = true;
        fetchNegotiationsData();
      }
    }
    
    // Reset ref on unmount so next mount will fetch
    return () => {
      logger.debug('[useNegotiationsData] Component unmounting, resetting fetch flag');
      hasFetchedOnMount.current = false;
    };
  }, [appId, fetchApplication, fetchNegotiationsData]);

  return {
    appId,
    application,
    negotiationsData,
    isLoading,
    refetchNegotiationsData: fetchNegotiationsData,
  };
};
