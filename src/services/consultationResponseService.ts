import { ConsultationResponse } from '../types/ConsultationResponse';

import { buildBackendUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';

const API_BASE = buildBackendUrl('/api/consultation-responses');

export async function getConsultationResponse(consultation_id: string, application_id?: string): Promise<ConsultationResponse> {
  if (!consultation_id) {
    throw new Error('consultation_id is required');
  }
  
  const params = new URLSearchParams();
  if (application_id) {
    params.append('application_id', application_id);
  }
  const queryString = params.toString();
  const url = `${API_BASE}/${consultation_id}${queryString ? '?' + queryString : ''}`;
  const res = await fetch(url, { method: 'GET', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch consultation response');
  return await res.json();
}

export async function saveConsultationResponse(data: Partial<ConsultationResponse>, application_id?: string): Promise<any> {
  const payload = { ...data };
  if (application_id && !payload.application_id) {
    payload.application_id = application_id;
  }
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save consultation response');
  return await res.json();
}
