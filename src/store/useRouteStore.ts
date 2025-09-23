import { create } from 'zustand';
import { getRoutesWithPoints } from '../services/routeMapService';

interface RouteState {
  routes: any[];
  loading: boolean;
  error: string | null;
  fetchRoutes: (applicationId: string) => Promise<void>;
}

export const useRouteStore = create<RouteState>((set) => ({
  routes: [],
  loading: false,
  error: null,
  fetchRoutes: async (applicationId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await getRoutesWithPoints(applicationId);
      set({ routes: data.routes, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch routes', loading: false });
    }
  },
}));
