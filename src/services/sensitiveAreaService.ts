import axios from 'axios';

// Types for sensitive area review summary
export interface LayerCheckItem {
  layerId: number;
  layerName: string;
  checkStatus: 'PENDING' | 'INTERSECT' | 'NO_INTERSECT' | 'FAILED' | 'ERROR';
  requiresScreening: boolean;
  manuallySelected: boolean;
  errorMessage?: string;
}

export interface SensitiveAreaReviewSummary {
  applicationId: string;
  checks: {
    automated: {
      passed: { screeningRequired: LayerCheckItem[]; noScreening: LayerCheckItem[] };
      failed: { screeningRequired: LayerCheckItem[]; noScreening: LayerCheckItem[] };
      cleared: { screeningRequired: LayerCheckItem[]; noScreening: LayerCheckItem[] };
    };
    manual: { selected: LayerCheckItem[]; customAdded: unknown[] };
    summary: { totalChecked: number; totalLayers: number };
  };
}

export async function getSensitiveAreas(applicationId: string) {
  const res = await axios.get(`/backend/api/sensitive-areas/${applicationId}`);
  return res.data;
}

export async function getSensitiveAreaCheckStatus(applicationId: string) {
  const res = await axios.get(`/backend/api/sensitive-area-check-status/${applicationId}`);
  return res.data;
}

export async function getSensitiveAreaReviewSummary(applicationId: string): Promise<SensitiveAreaReviewSummary> {
  const res = await axios.get(`/backend/api/${applicationId}/sensitive-area-review-summary`);
  return res.data;
}

export async function startSensitiveAreaCheck(applicationId: string, toleranceRequired: string, toleranceValue: number, routes: { routeName: string; gridPoints: { easting: string; northing: string; }[]; }[]) {
 const payload = {
    toleranceRequired, // 'yes' or 'no'
    toleranceValue,
    routes
  };
  const res = await axios.post(`/backend/api/sensitive-area-check/${applicationId}`, payload);
  return res.data;
}
