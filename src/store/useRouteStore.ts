import { create } from 'zustand';
import { getRoutesWithPoints, createRouteWithPoints, saveRoutesWithPoints, deleteRoutePoints, deleteRoute } from '../services/routeMapService';

export interface Route {
  route_id?: string;
  routeName?: string;
  gridPoints: Array<{ easting: number; northing: number; point_id?: string; route_id?: string }>;
  disconnectedroute_justification?: string;
}

interface RouteState {
  routes: Route[];
  loading: boolean;
  error: string | null;
  fetchRoutes: (applicationId: string) => Promise<void>;
  createRoute: (applicationId: string, route: Route) => Promise<void>;
  saveRoutes: (applicationId: string, routes: Route[]) => Promise<void>;
  deleteRoutePoints: (point_ids: string[]) => Promise<void>;
  updateRoutePoints: (routeIdx: number, points: any[]) => void;
  deleteRoute: (route_id: string) => Promise<void>;
}
 
export const useRouteStore = create<RouteState>((set, get) => ({
  deleteRoutePoints: async (point_ids: string[]) => {
    set({ loading: true, error: null });
    try {
      await deleteRoutePoints(point_ids);
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete route points', loading: false });
    }
    set({ loading: false });
  },
  deleteRoute: async (route_id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteRoute(route_id);
      // Optionally refetch routes if needed
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete route', loading: false });
    }
    set({ loading: false });
  },
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
  createRoute: async (applicationId: string, route: Route) => {
    set({ loading: true, error: null });
    try {
      await createRouteWithPoints(applicationId, route);
      await get().fetchRoutes(applicationId);
    } catch (err: any) {
      set({ error: err.message || 'Failed to create route', loading: false });
    }
    set({ loading: false });
  },
  saveRoutes: async (applicationId: string, routes: Route[]) => {
    set({ loading: true, error: null });
    try {
      await saveRoutesWithPoints(applicationId, routes);
      await get().fetchRoutes(applicationId);
    } catch (err: any) {
      set({ error: err.message || 'Failed to save routes', loading: false });
    }
    set({ loading: false });
  },
  updateRoutePoints: (routeIdx: number, points: any[]) => {
    const routes = [...get().routes];
    if (routes[routeIdx]) {
      routes[routeIdx] = { ...routes[routeIdx], gridPoints: points };
      set({ routes });
    }
  }
 

}));
