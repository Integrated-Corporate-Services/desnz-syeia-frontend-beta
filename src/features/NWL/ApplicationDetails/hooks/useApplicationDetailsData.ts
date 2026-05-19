import { useEffect, useState, useCallback } from "react";
import { 
  fetchApplicationDetails, 
  createOrUpdateApplicationDetails,
  updateApplicationDetailsFields,
  ApplicationDetailsData,
  CreateApplicationDetailsPayload 
} from "../services/applicationDetailsService";

/**
 * Hook for fetching and managing application details data
 * Uses direct service calls without store dependencies
 */
export const useApplicationDetailsData = (appId: string | null) => {
  const [applicationDetails, setApplicationDetails] = useState<ApplicationDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch application details
  const fetchDetails = useCallback(async () => {
    if (!appId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const details = await fetchApplicationDetails(appId);
      setApplicationDetails(details);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  // Create or update application details
  const saveDetails = useCallback(async (data: CreateApplicationDetailsPayload, pageId: number) => {
    if (!appId) throw new Error('Application ID is required');
    if (!pageId) throw new Error('Page ID is required');
    
    setIsLoading(true);
    setError(null);
    try {
      const saved = await createOrUpdateApplicationDetails(appId, data, pageId);
      setApplicationDetails(saved);
      return saved;
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  // Update specific fields
  const updateFields = useCallback(async (data: Partial<CreateApplicationDetailsPayload>, pageId: number) => {
    if (!appId) throw new Error('Application ID is required');
    if (!pageId) throw new Error('Page ID is required');
    
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateApplicationDetailsFields(appId, data, pageId);
      setApplicationDetails(updated);
      return updated;
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    if (appId) {
      fetchDetails();
    }
  }, [appId, fetchDetails]);

  return {
    applicationDetails,
    isLoading,
    error,
    refetch: fetchDetails,
    saveDetails,
    updateFields,
  };
};
