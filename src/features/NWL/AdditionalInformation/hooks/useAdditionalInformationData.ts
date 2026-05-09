import { useEffect } from 'react';
import { useApplicationStore } from '../../../../store/useApplicationStore';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';

/**
 * Custom hook to fetch and manage additional information data
 */
export const useAdditionalInformationData = () => {
  const appId = useGetApplicationId();
  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );

  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  return {
    appId,
    application,
    additionalInformationData: application?.additional_information_data,
  };
};
