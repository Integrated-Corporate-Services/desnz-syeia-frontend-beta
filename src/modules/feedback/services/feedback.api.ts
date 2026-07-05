import type { FeedbackPayload } from '../types/feedback.types';
import { getCsrfHeaders } from '../../../utils/csrf';

const ENDPOINT = '/backend/api/feedback';

function parseErrorMessage(body: Record<string, unknown>, status: number): string {
  if (typeof body['error'] === 'string') {
    return body['error'];
  }

  if (body['errors'] && typeof body['errors'] === 'object') {
    const errors = body['errors'] as Record<string, string>;
    const firstError = Object.values(errors)[0];
    if (firstError) {
      return firstError;
    }
  }

  if (status === 429) {
    return 'Too many feedback submissions. Please try again later.';
  }

  return `There was a problem sending your feedback. Please try again.`;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<{ id: string }> {
  const response = await fetch(ENDPOINT, {
    method:      'POST',
    headers:     { 
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    credentials: 'include',
    body:        JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(parseErrorMessage(body, response.status));
  }

  return response.json() as Promise<{ id: string }>;
}
