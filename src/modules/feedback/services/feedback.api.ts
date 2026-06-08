import type { FeedbackPayload } from '../types/feedback.types';

const ENDPOINT = '/backend/api/feedback';

export async function submitFeedback(payload: FeedbackPayload): Promise<{ id: string }> {
  const response = await fetch(ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message = typeof body['error'] === 'string'
      ? body['error']
      : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<{ id: string }>;
}
