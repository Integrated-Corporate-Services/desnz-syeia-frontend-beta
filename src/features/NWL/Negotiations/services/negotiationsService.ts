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

/**
 * Save negotiations data (creates if doesn't exist, updates if exists)
 * Uses POST which does upsert on backend
 */
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
    console.error('Error saving negotiations data:', error);
    return null;
  }
};

/**
 * Update negotiations data (alias for saveNegotiationsData for backward compatibility)
 * Now uses POST instead of PATCH to support upsert pattern
 */
export const updateNegotiationsData = async (
  applicationId: string,
  data: Partial<NegotiationsData>
): Promise<NegotiationsData | null> => {
  // Use POST (upsert) instead of PATCH to ensure record is created if it doesn't exist
  return saveNegotiationsData(applicationId, data);
};

/**
 * Partial update of negotiations (only updates provided fields)
 */
export const patchNegotiationsData = async (
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
    console.error('Error updating negotiations data:', error);
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
