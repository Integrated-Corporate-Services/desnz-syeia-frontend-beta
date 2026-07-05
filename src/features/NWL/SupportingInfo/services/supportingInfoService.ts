import { nwlSupportingInfo } from '../types';
import axios from 'axios';

const API_BASE = '/backend/api/nwl';

export const getSupportingInfo = async (applicationId: string): Promise<nwlSupportingInfo | null> => {
  try {
    const response = await axios.get(`${API_BASE}/${applicationId}/nwl-supporting-info`);
    return response.data;
  } catch {
    return null;
  }
};

export const saveSupportingInfo = async (info: nwlSupportingInfo): Promise<nwlSupportingInfo | null> => {
  try {
    const response = await axios.post(`${API_BASE}/nwl-supporting-info`, info);
    return response.data;
  } catch {
    return null;
  }
};
