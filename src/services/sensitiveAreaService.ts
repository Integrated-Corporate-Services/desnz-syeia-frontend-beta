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
    manual: { selected: LayerCheckItem[]; customAdded: unknown[]; noneSelected: boolean; };
    summary: { totalChecked: number; totalLayers: number };
  };
}

export async function getSensitiveAreas(applicationId: string) {
  const res = await axios.get(`/api/sensitive-areas/${applicationId}`);
  return res.data;
}

export async function getSensitiveAreaCheckStatus(applicationId: string) {
  const res = await axios.get(`/api/sensitive-area-check-status/${applicationId}`);
  return res.data;
}

export async function getSensitiveAreaReviewSummary(applicationId: string): Promise<SensitiveAreaReviewSummary> {
  const res = await axios.get(`/api/${applicationId}/sensitive-area-review-summary`);
  return res.data;
}

export async function startSensitiveAreaCheck(applicationId: string, toleranceRequired: string, toleranceValue: number, routes: { routeName: string; gridPoints: { easting: string; northing: string; }[]; }[]) {
 const payload = {
    toleranceRequired, // 'yes' or 'no'
    toleranceValue,
    routes
  };
  const res = await axios.post(`/api/sensitive-area-check/${applicationId}`, payload);
  return res.data;
}

export async function saveSensitiveReview(reviewPayload: any) {
  const res = await axios.post(`/api/save-sensitivereview`, reviewPayload);
  return res.data;
}

// Update manually selected layers in sensitive_area_route_checks table
export async function updateManuallySelectedLayers(applicationId: string, selectedLayerIds: number[], noneSelected: boolean) {
  const payload = {
    selectedLayerIds,
    noneSelected
  };
  const res = await axios.post(`/api/${applicationId}/sensitive-area-review-summary`, payload);
  return res.data;
}
