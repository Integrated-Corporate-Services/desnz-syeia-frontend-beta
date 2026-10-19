import { buildBackendUrl } from '../../../../utils/apiConfig';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import type { NoticeAnswer, NoticeStep, NoticesResponse } from '../types/notices';

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Sign in again.',
  403: 'You do not have permission to update this application.',
  404: 'Compulsory purchase order application not found.',
  409: 'Only draft compulsory purchase order applications can be updated.',
};
const DEFAULT_ERROR = 'Unable to load or save your publicity record. Try again.';

async function readResponse(response: Response): Promise<NoticesResponse> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Validation messages are written for the applicant; other failures use fixed copy.
    const message = response.status === 400 && typeof body.message === 'string'
      ? body.message
      : ERROR_MESSAGES[response.status] || DEFAULT_ERROR;
    throw Object.assign(new Error(message), { status: response.status });
  }
  const result = await response.json();
  return {
    record: result.record || {}, documents: result.documents || [], reference: result.reference || '',
    objectionsEmail: result.objectionsEmail || '', finalObjectionDate: result.finalObjectionDate ?? null, canEdit: result.canEdit,
  };
}

export const cpoNoticesService = {
  get: async (applicationId: string): Promise<NoticesResponse> =>
    readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/notices`), {
      credentials: 'include',
      headers: { 'X-Correlation-ID': generateCorrelationId() },
    })),

  save: async (applicationId: string, step: NoticeStep, answers: NoticeAnswer, saveForLater: boolean): Promise<NoticesResponse> => {
    let csrfHeaders = getCsrfHeaders();
    if (!csrfHeaders['X-CSRF-Token']) {
      await fetchCsrfToken();
      csrfHeaders = getCsrfHeaders();
    }
    if (!csrfHeaders['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');

    return readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/notices`), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': generateCorrelationId(), ...csrfHeaders },
      body: JSON.stringify({ step, answers, saveForLater }),
    }));
  },
};
