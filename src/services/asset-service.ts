import axios from 'axios';
import type { AssetRequest } from '../types/asset';
import log from '../logger';

// Service to fetch a single asset by applicationId and assetId
export const getAssetById = async (applicationId: string, assetId: string) => {
  try {
    const url = `/api/applications/${applicationId}/assets/${assetId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    log.error('[getAssetById] Error fetching asset by id:', error);
    throw error;
  }
};

// Service to delete asset by applicationId and assetId
export const deleteAsset = async (applicationId: string, assetId: string) => {
  try {
    const response = await axios.delete(`/api/applications/${applicationId}/assets/${assetId}`);
    return response.data;
  } catch (error) {
    log.error('[deleteAsset] Error deleting asset:', error);
    throw error;
  }
};

// Service to fetch asset details from the backend
export const fetchAssetDetails = async (applicationId: string) => {
  try {
    const response = await axios.get(`/api/applications/${applicationId}/assets`);
    return response.data;
  } catch (error) {
    log.error('[fetchAssetDetails] Error fetching asset details:', error);
    throw error;
  }
};
// Service to create asset(s) via POST
export const createAsset = async (payload: AssetRequest) => {
  const url = '/api/applications/assets';
  const response = await axios.post(url, payload);
  return response.data;
};

// Service to update asset(s) via PUT
export const updateAsset = async (payload: AssetRequest) => {
  const response = await axios.put('/api/applications/assets', payload);
  return response.data;
};
