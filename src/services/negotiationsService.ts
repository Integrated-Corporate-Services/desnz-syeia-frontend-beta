import { Negotiation } from '../types/Negotiation';

import { buildBackendUrl } from '../utils/apiConfig';

const API_BASE = buildBackendUrl('/backend/api/nwl');

export const getNegotiation = async (applicationId: string): Promise<Negotiation | null> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/negotiations`, {
      credentials: 'include'
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const saveNegotiation = async (negotiation: Negotiation): Promise<Negotiation | null> => {
  try {
    const response = await fetch(`${API_BASE}/negotiations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(negotiation),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};
