import { ConsultationResponse } from '../types/ConsultationResponse';

const API_BASE = '/backend/api/consultation-responses';

export async function getConsultationResponse(consultation_id: string): Promise<ConsultationResponse> {
  const url = `${API_BASE}?consultation_id=${encodeURIComponent(consultation_id)}`;
  const res = await fetch(url, { method: 'GET', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch consultation response');
  return await res.json();
}

export async function saveConsultationResponse(data: Partial<ConsultationResponse>): Promise<any> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save consultation response');
  return await res.json();
}
