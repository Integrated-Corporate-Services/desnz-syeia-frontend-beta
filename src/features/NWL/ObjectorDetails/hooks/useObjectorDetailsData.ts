import { useEffect, useState } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import { getObjectorDetails } from '../services/objectorDetailsService';
import { ObjectorDetails } from '../types';
import logger from '../../../../logger';

export const useObjectorDetailsData = () => {
  const appId = useGetApplicationId();
  const [objectorDetails, setObjectorDetails] = useState<ObjectorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch objector details directly via service
  useEffect(() => {
    const fetchObjectorDetails = async () => {
      if (appId) {
        setIsLoading(true);
        try {
          const details = await getObjectorDetails(appId);
          setObjectorDetails(details);
        } catch (error) {
          logger.error('Failed to fetch objector details:', error);
          setObjectorDetails(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchObjectorDetails();
  }, [appId]);

  return {
    appId,
    objectorDetails,
    isLoading,
  };
};
