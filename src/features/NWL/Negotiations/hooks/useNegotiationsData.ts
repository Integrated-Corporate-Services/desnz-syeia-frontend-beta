import { useEffect } from 'react';
import { useApplicationStore } from '../../../../store/useApplicationStore';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';

export const useNegotiationsData = () => {
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
    negotiationsData: application?.negotiations_data,
  };
};
