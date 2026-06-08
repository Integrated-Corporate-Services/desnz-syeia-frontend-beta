import { useState, useCallback } from 'react';
import { fetchEiaFeesDetails, createEiaFee, updateEiaFee, CreateEiaFeePayload, UpdateEiaFeePayload } from '../services/eiafeesservice';
import { EiaFees } from '../types/eiaFees';

export function useEiaFees() {
  const [eiaFees, setEiaFees] = useState<EiaFees | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEiaFees = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError(null);
    setEiaFees(null);
    try {
      const data = await fetchEiaFeesDetails(applicationId);
      // If backend returns an array, extract first item; else use data directly
      if (Array.isArray(data)) {
        setEiaFees(data[0] ?? null);
      } else {
        setEiaFees(data as EiaFees);
      }
    } catch (err: unknown) {
      let message = 'Failed to fetch EIA Fees';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: string }).message === 'string') {
        message = (err as { message?: string }).message!;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEiaFees = useCallback(async (payload: CreateEiaFeePayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createEiaFee(payload);
      setEiaFees(data);
    } catch (err: unknown) {
      let message = 'Failed to create EIA Fee';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: string }).message === 'string') {
        message = (err as { message?: string }).message!;
      }
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEiaFees = useCallback(async (payload: UpdateEiaFeePayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateEiaFee(payload);
      setEiaFees(data);
    } catch (err: unknown) {
      let message = 'Failed to update EIA Fee';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: string }).message === 'string') {
        message = (err as { message?: string }).message!;
      }
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    eiaFees,
    loading,
    error,
    fetchEiaFees,
    createEiaFees,
    updateEiaFees,
  };
}
