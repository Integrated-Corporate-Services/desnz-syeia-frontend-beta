import { useEffect, useState } from 'react';
import { useApplicationStore } from '../../../../store/useApplicationStore';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import { getAdditionalInformationData } from '../services/additionalInformationService';
import { AdditionalInformationData } from '../types';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('useAdditionalInformationData');

/**
 * Custom hook to fetch and manage additional information data
 * Fetches data separately from the main application to ensure it's always loaded
 */
export const useAdditionalInformationData = () => {
  const appId = useGetApplicationId();
  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );
  
  const [additionalInformationData, setAdditionalInformationData] = useState<AdditionalInformationData | undefined>(
    application?.additional_information_data
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch main application
  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);
  
  // Fetch additional information data separately to ensure it's loaded
  useEffect(() => {
    const fetchAdditionalInfo = async () => {
      if (!appId) return;
      
      // First check if data exists in application store (from backend enrichment)
      if (application?.additional_information_data) {
        setAdditionalInformationData(application.additional_information_data);
        return;
      }
      
      // If not in store, fetch separately
      setIsLoading(true);
      try {
        const data = await getAdditionalInformationData(appId);
        if (data) {
          setAdditionalInformationData(data);
        }
      } catch (error) {
        logger.error('Error fetching additional information', { error, appId });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdditionalInfo();
  }, [appId, application?.additional_information_data]);

  return {
    appId,
    application,
    additionalInformationData,
    isLoading,
  };
};
