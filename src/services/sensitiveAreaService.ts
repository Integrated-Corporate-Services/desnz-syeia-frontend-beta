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

// Update manually selected layers in sensitive_area_route_checks table
export async function updateManuallySelectedLayers(applicationId: string, selectedLayerIds: number[], noneSelected: boolean) {
  const payload = {
    selectedLayerIds,
    noneSelected
  };
  const res = await axios.post(`/backend/api/${applicationId}/sensitive-area-review-summary`, payload);
  return res.data;
}

// ============================================================================
// Manual Sensitive Area Management (AddOtherAreasPage - Wireframe D)
// ============================================================================

// Types for manual sensitive areas
export interface PreIdentifiedArea {
  id: string;
  layerId: number;
  layerName: string;
  checkType: string;
  checkStatus: string;
  manuallySelected: boolean;
  manuallySelectedBy?: string;
  manuallySelectedAt?: string;
  canRemove: false;
}

export interface ManuallyAddedArea {
  id: string;
  manualAreaName: string;
  checkType: string;
  checkStatus: string;
  manuallySelectedBy: string;
  manuallySelectedAt: string;
  canRemove: true;
}

export interface AllSensitiveAreasResponse {
  applicationId: string;
  preIdentifiedAreas: PreIdentifiedArea[];
  manuallyAddedAreas: ManuallyAddedArea[];
}

/**
 * Get all sensitive areas (pre-identified + manually added)
 * Used by AddOtherAreasPage to display both automated and manual areas
 */
export async function getAllSensitiveAreas(applicationId: string): Promise<AllSensitiveAreasResponse> {
  const res = await axios.get(`/backend/api/applications/${applicationId}/sensitive-areas`);
  return res.data;
}

/**
 * Add a manually entered sensitive area (free-text)
 * @param applicationId - Application UUID
 * @param manualAreaName - Free-text name of the sensitive area
 * @returns Created area object
 */
export async function addManualArea(applicationId: string, manualAreaName: string): Promise<{ success: boolean; message: string; area: ManuallyAddedArea }> {
  const payload = { manualAreaName };
  const res = await axios.post(`/backend/api/applications/${applicationId}/sensitive-areas/manual`, payload);
  return res.data;
}

/**
 * Remove a manually added sensitive area
 * @param applicationId - Application UUID
 * @param areaId - Area UUID to remove
 * @returns Success response
 */
export async function removeManualArea(applicationId: string, areaId: string): Promise<{ success: boolean; message: string; removedAreaId: string }> {
  const res = await axios.delete(`/backend/api/applications/${applicationId}/sensitive-areas/manual/${areaId}`);
  return res.data;
}
