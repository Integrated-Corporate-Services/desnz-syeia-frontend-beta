import { create } from 'zustand';
import SupportingInfoService from '../services/SupportingInfoService';
import type { SupportingInfo, SupportingInfoRequest } from '../types/SupportingInfo';

type State = {
  supportingInfo: SupportingInfo | null;
  loading: boolean;
  error: string | null;
  fetchSupportingInfo: (applicationId: string) => Promise<void>;
  saveSupportingInfo: (data: SupportingInfoRequest) => Promise<void>;
};

export const useSupportingInfoStore = create<State>((set) => ({
  supportingInfo: null,
  loading: false,
  error: null,

  fetchSupportingInfo: async (applicationId) => {
    set({ loading: true, error: null });
    try {
      const response = await SupportingInfoService.getSupportingInfo(applicationId);
      set({ supportingInfo: response.supportingInfo[0] || null });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch supporting info.' });
    } finally {
      set({ loading: false });
    }
  },

  saveSupportingInfo: async (data) => {
    set({ loading: true, error: null });
    try {
      if (data.application_id) {
        const response = await SupportingInfoService.getSupportingInfo(data.application_id);
        if (response.supportingInfo.length > 0) {
          await SupportingInfoService.updateSupportingInfo(data);
        } else {
          await SupportingInfoService.createSupportingInfo(data);
        }
      } else {
        throw new Error('Application ID is required.');
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to save supporting info.' });
    } finally {
      set({ loading: false });
    }
  },
}));