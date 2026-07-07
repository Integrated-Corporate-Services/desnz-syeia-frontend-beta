import { useState, useCallback } from 'react';
import SupportingInfoService from '../services/SupportingInfoService';
import type { SupportingInfo, SupportingInfoRequest, SupportingInfoResponse } from '../types/SupportingInfo';

export function useSupportingInfo() {
  const [supportingInfo, setSupportingInfo] = useState<SupportingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupportingInfo = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError(null);
    setSupportingInfo(null);
    try {
      const response = await SupportingInfoService.getSupportingInfo(applicationId);
      setSupportingInfo(response.supportingInfo[0] || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch supporting info.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSupportingInfo = useCallback(async (data: SupportingInfoRequest): Promise<SupportingInfoResponse | void> => {
    setLoading(true);
    setError(null);
    try {
      if (!data.application_id) {
        throw new Error('Application ID is required.');
      }

      const response = await SupportingInfoService.getSupportingInfo(data.application_id);
      let result;

      if (response.supportingInfo.length > 0) {
        result = await SupportingInfoService.updateSupportingInfo(data);
      } else {
        result = await SupportingInfoService.createSupportingInfo(data);
      }

      // Refresh the local state with saved data
      await fetchSupportingInfo(data.application_id);

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to save supporting info.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSupportingInfo]);

  return {
    supportingInfo,
    loading,
    error,
    fetchSupportingInfo,
    saveSupportingInfo,
  };
}
