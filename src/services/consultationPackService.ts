import { ConsultationPack } from '../types/consultationPack';
import { buildBackendUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';

export async function saveConsultationPack(pack: ConsultationPack) {
  const res = await fetch(buildBackendUrl('/api/consultation-pack'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(pack),
  });
  if (!res.ok) throw new Error('Failed to save consultation pack');
  return res.json();
}
// Service for fetching consultation pack details
export async function getConsultationPack(consultationId: string, applicationId: string) {
  const params = new URLSearchParams({ consultationId, applicationId });
  const res = await fetch(buildBackendUrl(`/api/consultation-pack?${params.toString()}`), {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to fetch consultation pack");
  return res.json();
}
