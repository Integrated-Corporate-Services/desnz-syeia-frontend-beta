import { ConsultationPack } from '../types/consultationPack';

export async function saveConsultationPack(pack: ConsultationPack) {
  const res = await fetch('/backend/api/consultation-pack', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pack),
  });
  if (!res.ok) throw new Error('Failed to save consultation pack');
  return res.json();
}
// Service for fetching consultation pack details
export async function getConsultationPack(consultationId: string, applicationId: string) {
  const params = new URLSearchParams({ consultationId, applicationId });
  const res = await fetch(`/backend/api/consultation-pack?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch consultation pack");
  return res.json();
}
