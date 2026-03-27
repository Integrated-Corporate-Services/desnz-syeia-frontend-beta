
import { fetchEiaFeesDetails, createEiaFee, updateEiaFee, CreateEiaFeePayload, UpdateEiaFeePayload } from '../services/eiafeesservice';
import { EiaFees } from '../types/eiaFees';
import { create } from 'zustand';


interface EiaFeesState {
  eiaFees: EiaFees | null;
  loading: boolean;
  error: string | null;
  fetchEiaFees: (applicationId: string) => Promise<void>;
  createEiaFees: (payload: CreateEiaFeePayload) => Promise<void>;
  updateEiaFees: (payload: UpdateEiaFeePayload) => Promise<void>;
}

export const useEiaFeesStore = create<EiaFeesState>((set) => ({
  eiaFees: null,
  loading: false,
  error: null,

  fetchEiaFees: async (applicationId: string) => {
    set({ loading: true, error: null, eiaFees: null });
    try {
      const data = await fetchEiaFeesDetails(applicationId);
      // If backend returns an array, extract first item; else use data directly
      if (Array.isArray(data)) {
        set({ eiaFees: data[0] ?? null, loading: false });
      } else {
        set({ eiaFees: data as EiaFees, loading: false });
      }
    } catch (error: unknown) {
      let message = 'Failed to fetch EIA Fees';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
        message = (error as { message?: string }).message!;
      }
      set({ error: message, loading: false });
    }
  },

  createEiaFees: async (payload: CreateEiaFeePayload) => {
    set({ loading: true, error: null });
    try {
      const data = await createEiaFee(payload);
      set({ eiaFees: data, loading: false });
    } catch (error: unknown) {
      let message = 'Failed to create EIA Fee';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
        message = (error as { message?: string }).message!;
      }
      set({ error: message, loading: false });
    }
  },

  updateEiaFees: async (payload: UpdateEiaFeePayload) => {
    set({ loading: true, error: null });
    try {
      const data = await updateEiaFee(payload);
      set({ eiaFees: data, loading: false });
    } catch (error: unknown) {
      let message = 'Failed to update EIA Fee';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
        message = (error as { message?: string }).message!;
      }
      set({ error: message, loading: false });
    }
  },
}));
