import { useState, useCallback } from 'react';
import { getRoutesWithPoints, createRouteWithPoints, saveRoutesWithPoints, deleteRoutePoints as deleteRoutePointsService, deleteRoute as deleteRouteService } from '../services/routeMapService';

export interface Route {
  route_id?: string;
  routeName?: string;
  gridPoints: Array<{ easting: number; northing: number; point_id?: string; route_id?: string }>;
  disconnectedroute_justification?: string;
}

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError(null);
    setRoutes([]);
    try {
      const data = await getRoutesWithPoints(applicationId);
      setRoutes(data.routes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoute = useCallback(async (applicationId: string, route: Route) => {
    setLoading(true);
    setError(null);
    try {
      await createRouteWithPoints(applicationId, route);
      await fetchRoutes(applicationId);
    } catch (err: any) {
      setError(err.message || 'Failed to create route');
    } finally {
      setLoading(false);
    }
  }, [fetchRoutes]);

  const saveRoutes = useCallback(async (applicationId: string, routesToSave: Route[]) => {
    setLoading(true);
    setError(null);
    try {
      await saveRoutesWithPoints(applicationId, routesToSave);
      await fetchRoutes(applicationId);
    } catch (err: any) {
      setError(err.message || 'Failed to save routes');
    } finally {
      setLoading(false);
    }
  }, [fetchRoutes]);

  const deleteRoutePoints = useCallback(async (applicationId: string, point_ids: string[]) => {
    setLoading(true);
    setError(null);
    try {
      await deleteRoutePointsService(applicationId, point_ids);
    } catch (err: any) {
      setError(err.message || 'Failed to delete route points');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRoute = useCallback(async (applicationId: string, route_id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteRouteService(applicationId, route_id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete route');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRoutePoints = useCallback((routeIdx: number, points: any[]) => {
    setRoutes((currentRoutes) => {
      const newRoutes = [...currentRoutes];
      if (newRoutes[routeIdx]) {
        newRoutes[routeIdx] = { ...newRoutes[routeIdx], gridPoints: points };
      }
      return newRoutes;
    });
  }, []);

  return {
    routes,
    loading,
    error,
    fetchRoutes,
    createRoute,
    saveRoutes,
    deleteRoutePoints,
    deleteRoute,
    updateRoutePoints,
  };
}
