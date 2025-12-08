import { nwlSupportingInfo } from '../types/nwlSupportingInfo';

const API_BASE = '/backend/api/nwl';

export const getSupportingInfo = async (applicationId: string): Promise<nwlSupportingInfo | null> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/nwl-supporting-info`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const saveSupportingInfo = async (info: nwlSupportingInfo): Promise<nwlSupportingInfo | null> => {
  try {
    const response = await fetch(`${API_BASE}/nwl-supporting-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};
