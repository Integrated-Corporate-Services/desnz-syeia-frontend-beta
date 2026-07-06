/**
 * useNWLProgress Hook
 * React hook for managing NWL application progress
 */

import { useState, useCallback } from 'react';
import { nwlProgressService } from '../services/nwlProgressService';

export interface ProgressItem {
  subsection_name: string;
  status: string;
  subsection_type?: string;
  created_at?: string;
  updated_at?: string;
}

export const useNWLProgress = (applicationId?: string) => {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch progress for the application
   */
  const fetchProgress = useCallback(async () => {
    if (!applicationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await nwlProgressService.fetchProgress(applicationId);
      setProgress(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch progress';
      setError(errorMessage);
      logger.error('Error fetching progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  /**
   * Update progress for a subsection
   */
  const updateProgress = useCallback(
    async (subsectionName: string, status: string) => {
      if (!applicationId) {
        throw new Error('Application ID is required');
      }

      setIsLoading(true);
      setError(null);

      try {
        await nwlProgressService.updateProgress(applicationId, subsectionName, status);
        // Refresh progress after update
        await fetchProgress();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update progress';
        setError(errorMessage);
        logger.error('Error updating progress:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [applicationId, fetchProgress]
  );



  /**
   * Get progress status for a specific subsection
   */
  const getSubsectionStatus = useCallback(
    (subsectionName: string): string | undefined => {
      const item = progress.find((p) => p.subsection_name === subsectionName);
      return item?.status;
    },
    [progress]
  );

  return {
    progress,
    isLoading,
    error,
    fetchProgress,
    updateProgress,
    getSubsectionStatus,
  };
};
