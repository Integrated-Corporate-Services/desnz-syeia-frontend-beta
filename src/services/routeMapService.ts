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

  return axios.post('/backend/api/map-route', {
    applicationId,
    routes,
  });
}

export async function getRoutesWithPoints(applicationId: string) {
  if (!applicationId) throw new Error('applicationId is required');
  const res = await axios.get(`/backend/api/applications/${applicationId}/route`);
  return res.data;
}

