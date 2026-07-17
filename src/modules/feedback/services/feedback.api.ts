import type { FeedbackPayload } from '../types/feedback.types';
import axios from 'axios';

const ENDPOINT = '/api/feedback';

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
  try {
    const response = await axios.post(ENDPOINT, payload);
    return response.data;
  } catch (error: any) {
    const body = error.response?.data || {};
    const status = error.response?.status || 500;
    throw new Error(parseErrorMessage(body, status));
  }
}
