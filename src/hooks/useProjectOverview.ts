import { useState, useCallback } from 'react';
import { getProjectOverview, saveProjectOverview } from '../services/projectApiService';
import type { ProjectOverviewModel } from '../types/projectOverview';

export function useProjectOverview() {
  const [projectOverview, setProjectOverview] = useState<(ProjectOverviewModel & { forms?: Record<string, any> }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectOverview = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectOverview(applicationId);
      setProjectOverview(data);
    } catch (err: any) {
      // Preserve existing data on error
      setError(err.message || 'Failed to fetch project overview');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProject = useCallback(async (data: Partial<ProjectOverviewModel>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await saveProjectOverview(data);
      setProjectOverview(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to save project overview');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    projectOverview,
    loading,
    error,
    fetchProjectOverview,
    saveProject,
  };
}
