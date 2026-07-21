// Delete a route by route_id
export async function deleteRoute(applicationId: string, route_id: string) {
  return axios.delete(`/api/applications/${applicationId}/route/${route_id}`);
}

// Bulk delete route points by point_ids
export async function deleteRoutePoints(applicationId: string, point_ids: string[]) {
  return axios.delete(`/api/applications/${applicationId}/route-points-remove`, {
    data: { point_ids, applicationId },
    headers: { 'Content-Type': 'application/json' },
  });
}
import axios from 'axios';
import { RoutePoint } from '../components/SensitiveAreaCheckMap';

export async function submitRoutePoints(applicationId: string, points: RoutePoint[]) {
  const getRouteName = (idx: number) => `Route ${String.fromCharCode(65 + idx)}`;
  // Helper to convert points to numbers
  const convertPoints = (pts: RoutePoint[]) => pts.map(pt => ({
    easting: Number(pt.easting),
    northing: Number(pt.northing)
  }));
  // If points is an array of arrays, treat as multiple routes
  // Only handle single route for now
  const routes = [{ routeName: 'Route A', gridPoints: convertPoints(points) }];

  return axios.post('/api/map-route', {
    applicationId,
    routes,
  });
}

export async function getRoutesWithPoints(applicationId: string) {
  if (!applicationId) throw new Error('applicationId is required');
  const res = await axios.get(`/api/applications/${applicationId}/route`);
  return res.data;
}

// New: create route with points
export async function createRouteWithPoints(applicationId: string, route: any) {
  return axios.post('/api/map-route', {
    applicationId,
    routes: [route],
  });
}

// New: save (update) route with points
export async function saveRoutesWithPoints(applicationId: string, routes: any[]) {
  return axios.put('/api/map-route', {
    applicationId,
    routes,
  });
}

