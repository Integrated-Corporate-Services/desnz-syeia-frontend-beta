import axios from 'axios';
import type { AssetRequest } from '../types/asset';
import { ERROR_MESSAGES } from '../constants/error';
import log from '../logger';

// Service to fetch a single asset by applicationId and assetId
export const getAssetById = async (applicationId: string, assetId: string) => {
  try {
    log.debug('[getAssetById] Fetching asset', { applicationId, assetId });
    const url = `/backend/api/applications/${applicationId}/assets/${assetId}`;
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
    log.debug('[deleteAsset] Deleting asset', { applicationId, assetId });
    const response = await axios.delete(`/backend/api/applications/${applicationId}/assets/${assetId}`);
    log.info('[deleteAsset] Asset deleted successfully');
    return response.data;
  } catch (error) {
    log.error('[deleteAsset] Error deleting asset:', error);
    throw error;
  }
};

// Service to fetch asset details from the backend
export const fetchAssetDetails = async (applicationId: string) => {
  try {
    log.debug('[fetchAssetDetails] Fetching asset details', { applicationId });
    const response = await axios.get(`/backend/api/applications/${applicationId}/assets`);
    return response.data;
  } catch (error) {
    log.error('[fetchAssetDetails] Error fetching asset details:', error);
    throw error;
  }
};
// Service to create asset(s) via POST
export const createAsset = async (payload: AssetRequest) => {
  log.debug('[createAsset] Creating asset', { applicationId: payload.applicationId });
  const url = '/backend/api/applications/assets';
  const response = await axios.post(url, payload);
  log.info('[createAsset] Asset created successfully');
  return response.data;
};

// Service to update asset(s) via PUT
export const updateAsset = async (payload: AssetRequest) => {
  log.debug('[updateAsset] Updating asset', { applicationId: payload.applicationId });
  
  try {
    const response = await axios.put('/backend/api/applications/assets', payload);
    log.info('[updateAsset] Asset updated successfully');
    return response.data;
  } catch (error: any) {
    // Handle version conflict error
    if (error.response?.status === 409 || error.response?.data?.error === 'VERSION_CONFLICT') {
      log.warn('[updateAsset] Version conflict detected');
      const conflictError: any = new Error(
        error.response?.data?.message || 
        ERROR_MESSAGES.VERSION_CONFLICT
      );
      conflictError.statusCode = 409;
      conflictError.isVersionConflict = true;
      throw conflictError;
    }
    
    log.error('[updateAsset] Error updating asset:', error);
    throw error;
  }
};