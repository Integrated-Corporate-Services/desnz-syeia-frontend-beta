import axios from 'axios';
import { SensitiveAreaReview } from '../types/sensitiveAreaReviewTypes';

export async function getSensitiveAreaReview(applicationId: string): Promise<SensitiveAreaReview[]> {
  const res = await axios.get(`/api/get-sensitivereview?application_id=${applicationId}`);
  return res.data;
}

export async function saveSensitiveAreaReview(review: SensitiveAreaReview): Promise<SensitiveAreaReview> {
  const res = await axios.post('/api/save-sensitivereview', review);
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
  const res = await axios.get(`/api/${applicationId}/sensitive-area-review-summary/manual`);
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
  const res = await axios.post(`/api/${applicationId}/sensitive-area-review-summary/manual`, payload);
  return res.data;
}

/**
 * Remove a manually added sensitive area
 * @param applicationId - Application UUID
 * @param areaId - Area UUID to remove
 * @returns Success response
 */
export async function removeManualArea(applicationId: string, areaId: string): Promise<{ success: boolean; message: string; removedAreaId: string }> {
  const res = await axios.delete(`/api/${applicationId}/sensitive-area-review-summary/manual/${areaId}`);
  return res.data;
}
