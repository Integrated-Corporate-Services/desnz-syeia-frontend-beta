import { create } from 'zustand';
import { getProjectOverview, saveProjectOverview, listProjects } from '../services/projectApiService';
import type { ProjectOverviewModel } from '../types/projectOverview';



type ProjectStoreState = {
  projectOverview: (ProjectOverviewModel & { forms?: Record<string, any> }) | null;
  projectList: ProjectOverviewModel[];
  loading: boolean;
  error: string | null;
  fetchProjectOverview: (applicationId: string) => Promise<void>;
  saveProjectOverview: (data: Partial<ProjectOverviewModel>) => Promise<void>;
  fetchProjectList: () => Promise<void>;
}

export const useProjectStore = create<ProjectStoreState>((set) => ({
  projectOverview: null,
  projectList: [],
  loading: false,
  error: null,

  fetchProjectOverview: async (applicationId) => {
    set({ loading: true, error: null });
    try {
      const data = await getProjectOverview(applicationId);
      set({ projectOverview: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch project overview', loading: false });
    }
  },

  saveProjectOverview: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await saveProjectOverview(data);
      set({ projectOverview: result, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to save project overview', loading: false });
    }
  },

  fetchProjectList: async () => {
    set({ loading: true, error: null });
    try {
      const list = await listProjects();
      set({ projectList: list, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch project list', loading: false });
    }
  },
}));
