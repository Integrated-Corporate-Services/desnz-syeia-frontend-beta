import { useState, useCallback } from 'react';
import { progressApiService } from '../services/progressApiService';
import type { ProgressItem } from '../types/progress';

export function useProgress() {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await progressApiService.fetchApplicationProgress(applicationId);
      setProgress(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch progress');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgressItem = useCallback(async (
    applicationId: string,
    subsectionName: string,
    status: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      await progressApiService.updateApplicationProgress(applicationId, subsectionName, status);
      // Refresh progress after update
      await fetchProgress(applicationId);
    } catch (err: any) {
      setError(err.message || 'Failed to update progress');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    fetchProgress,
    updateProgressItem,
  };
}
