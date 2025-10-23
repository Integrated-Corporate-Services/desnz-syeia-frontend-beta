import axios from 'axios';

// Service to fetch asset details from the backend
export const fetchAssetDetails = async (applicationId: string) => {
  try {
    console.log('Fetching asset details for applicationId:', applicationId);
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
  const response = await axios.post('/backend/api/applications/assets', payload);
  return response.data;
};

// Service to update asset(s) via PUT
export const updateAsset = async (payload: AssetRequest) => {
  const response = await axios.put('/backend/api/applications/assets', payload);
  return response.data;
};
