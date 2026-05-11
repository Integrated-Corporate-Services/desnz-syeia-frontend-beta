import { useState, useEffect } from 'react';
import { useApplicationStore } from '../../../../store/useApplicationStore';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('useCheckYourAnswersData');

/**
 * Hook to fetch and manage Check Your Answers data
 * Retrieves full application data from the store
 */
export const useCheckYourAnswersData = (appId: string) => {
  const fetchAndSetApplication = useApplicationStore((state) => state.fetchAndSetApplication);
  const application = useApplicationStore((state) => state.application);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplication = async () => {
      if (!appId) {
        setError('Application ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        logger.debug('Fetching application data', { appId });
        await fetchAndSetApplication(appId);
        logger.debug('Application data fetched successfully', { appId });
      } catch (err) {
        logger.error('Failed to fetch application data', err);
        setError('Failed to load application data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [appId, fetchAndSetApplication]);

  return {
    application,
    loading,
    error,
  };
};
