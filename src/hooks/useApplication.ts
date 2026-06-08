import { useState, useCallback } from 'react';
import { applicationApiService } from '../services/applicationApiService';
import type { Application, NewApplication } from '../types/application';

export function useApplication() {
  const [application, setApplication] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationApiService.getApplicationById(applicationId);
      setApplication(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch application');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async (userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationApiService.fetchApplicationsByUser(userId || '');
      setApplications(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewApplication = useCallback(async (newApp: NewApplication) => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationApiService.createApplication(newApp);
      setApplication(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create application');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitApplication = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await applicationApiService.submitApplication(applicationId);
      // Refresh application data after submission
      if (application?.application_id === applicationId) {
        await fetchApplication(applicationId);
      }
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [application, fetchApplication]);

  return {
    application,
    applications,
    loading,
    error,
    fetchApplication,
    fetchApplications,
    createNewApplication,
    submitApplication,
    setApplication,
  };
}
