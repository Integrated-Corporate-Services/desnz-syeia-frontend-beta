import { NegotiationsData } from '../types';

const API_BASE = '/backend/api/nwl';

export const getNegotiationsData = async (applicationId: string): Promise<NegotiationsData | null> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/negotiations`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch negotiations data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const saveNegotiationsData = async (
  applicationId: string,
  data: Partial<NegotiationsData>
): Promise<NegotiationsData | null> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/negotiations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save negotiations data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const updateNegotiationsData = async (
  applicationId: string,
  data: Partial<NegotiationsData>
): Promise<NegotiationsData | null> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/negotiations`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update negotiations data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const deleteNegotiationsData = async (applicationId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/negotiations`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete negotiations data: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    return false;
  }
};
