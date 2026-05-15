import { useEffect } from "react";
import { useApplicationStore } from "../../../../store/useApplicationStore";

/**
 * Hook for fetching and managing application details data
 */
export const useApplicationDetailsData = (appId: string | null) => {
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
    application,
    refetch: () => appId && fetchAndSetApplication(appId),
  };
};
