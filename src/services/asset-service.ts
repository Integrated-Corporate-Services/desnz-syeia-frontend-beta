// Service to fetch a single asset by applicationId and assetId
export const getAssetById = async (applicationId: string, assetId: string) => {
  try {
    const url = `/backend/api/applications/${applicationId}/assets/${assetId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('[getAssetById] Error fetching asset by id:', error);
    throw error;
  }
};
// Service to delete asset by applicationId and assetId
export const deleteAsset = async (applicationId: string, assetId: string) => {
  try {
    const response = await axios.delete(`/backend/api/applications/${applicationId}/assets/${assetId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
};
import axios from 'axios';

// Service to fetch asset details from the backend
export const fetchAssetDetails = async (applicationId: string) => {
  try {
  const response = await axios.get(`/backend/api/applications/${applicationId}/assets`);
    return response.data;
  } catch (error) {
    console.error('Error fetching asset details:', error);
    throw error;
  }
};

// Service to create asset(s) via POST

import type { AssetRequest } from '../types/asset';
export const createAsset = async (payload: AssetRequest) => {
  const url = '/backend/api/applications/assets';
  const response = await axios.post(url, payload);
  return response.data;
};

// Service to update asset(s) via PUT
export const updateAsset = async (payload: AssetRequest) => {
  const response = await axios.put('/backend/api/applications/assets', payload);
  return response.data;
};
