import { create } from 'zustand';
import { progressApiService } from '../services/progressApiService';

interface ProgressState {
  progress: any;
  loading: boolean;
  error: string | null;
  fetchProgress: (applicationId: string) => Promise<void>;
  updateProgress: (
    applicationId: string,
    subsection_name: string,
    status: string
  ) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  progress: null,
  loading: false,
  error: null,

  fetchProgress: async (applicationId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await progressApiService.fetchApplicationProgress(applicationId);
      set({ progress: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch progress', loading: false });
    }
  },

  updateProgress: async (
    applicationId: string,
    subsection_name: string,
    status: string
  ) => {
    set({ loading: true, error: null });
    try {
      await progressApiService.updateApplicationProgress(
        applicationId,
        subsection_name,
        status
      );
      // Optionally refetch progress after update
      await (useProgressStore.getState().fetchProgress(applicationId));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update progress', loading: false });
    }
    set({ loading: false });
  },
}));
