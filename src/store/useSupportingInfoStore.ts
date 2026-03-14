import { create } from 'zustand';
import SupportingInfoService from '../services/SupportingInfoService';
import type { SupportingInfo, SupportingInfoRequest, SupportingInfoResponse } from '../types/SupportingInfo';

type State = {
  supportingInfo: SupportingInfo | null;
  loading: boolean;
  error: string | null;
  fetchSupportingInfo: (applicationId: string) => Promise<void>;
  saveSupportingInfo: (data: SupportingInfoRequest) => Promise<SupportingInfoResponse | void>;
};

export const useSupportingInfoStore = create<State>((set, get) => ({
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
            await get().fetchSupportingInfo(data.application_id);

            // Return the result so the component can use it
            return result;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to save supporting info.';
            set({ error: errorMessage });
            throw err;
        } finally {
            set({ loading: false });
        }
    },
}));