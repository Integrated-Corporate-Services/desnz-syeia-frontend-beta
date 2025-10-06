
import axios from 'axios';

export async function getSensitiveAreas(applicationId: string) {
  const res = await axios.get(`/backend/api/sensitive-areas/${applicationId}`);
  return res.data;
}

export async function startSensitiveAreaCheck(applicationId: string, toleranceRequired: boolean, routes: { routeName: string; gridPoints: { easting: string; northing: string; }[]; }[]) {
  const payload = { toleranceRequired, routes };
  const res = await axios.post(`/backend/api/sensitive-area-check/${applicationId}`, payload);
  return res.data;
}
