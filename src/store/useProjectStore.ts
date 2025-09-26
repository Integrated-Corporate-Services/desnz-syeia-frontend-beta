import { create } from 'zustand';
import { getProjectOverview, saveProjectOverview, listProjects } from '../services/projectApiService';
import type { ProjectOverviewModel } from '../types/projectOverview';



// Add ProjectListItem type for project list (matches backend fields)
export interface ProjectListItem {
  project_id: string;
  project_name: string;
  application_id: string;
  operator_ref: string;
}

type ProjectStoreState = {
  projectOverview: (ProjectOverviewModel & { forms?: Record<string, any> }) | null;
  projectList: ProjectListItem[];
  loading: boolean;
  error: string | null;
  fetchProjectOverview: (applicationId: string) => Promise<void>;
  saveProjectOverview: (data: Partial<ProjectOverviewModel>) => Promise<void>;
  fetchProjectList: (application_id: string) => Promise<void>;
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

  fetchProjectList: async (applicationId: string) => {
    set({ loading: true, error: null });
    try {
      const list = await listProjects(applicationId);
      // Defensive: ensure all required fields exist
      const normalized = Array.isArray(list)
        ? list.map((p: any) => ({
            project_id: p.project_id || '',
            project_name: p.project_name || '',
            application_id: p.application_id || '',
            operator_ref: p.operator_ref || '',
            application_relation_id: p.application_relation_id || '',
          }))
        : [];
      set({ projectList: normalized, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch project list', loading: false });
    }
  },
}));
