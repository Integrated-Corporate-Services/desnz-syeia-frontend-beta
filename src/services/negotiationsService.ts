import { Negotiation } from '../types/Negotiation';

const API_BASE = '/backend/api/nwl';

export const getNegotiation = async (applicationId: string): Promise<Negotiation | null> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/negotiations`);
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
      body: JSON.stringify(negotiation),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};
