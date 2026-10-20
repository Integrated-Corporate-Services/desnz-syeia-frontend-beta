import { applicationApiService } from '../../../../services/applicationApiService';
import { buildBackendUrl } from '../../../../utils/apiConfig';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import type { CpoMeetingApplication, CpoMeetingDetails } from '../types/preSubmissionMeeting';

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Sign in again before saving your answer.',
  403: 'You do not have permission to update this application. Refresh the page or contact support.',
  404: 'The meeting service or application is unavailable. Refresh the page or contact support.',
  409: 'This application can no longer be updated or its meeting request has already been submitted. Refresh the page.',
};
const DEFAULT_SAVE_ERROR = 'Unable to save your pre-submission meeting answer. Try again.';

export const cpoPreSubmissionMeetingService = {
  get: (applicationId: string): Promise<CpoMeetingApplication> =>
    applicationApiService.getApplicationById(applicationId),

  save: async (
    applicationId: string,
    requested: boolean | null,
    complete: boolean,
    meeting: CpoMeetingDetails = { answer: null, reason: '' },
  ): Promise<CpoMeetingApplication> => {
    let csrfHeaders = getCsrfHeaders();
    if (!csrfHeaders['X-CSRF-Token']) {
      await fetchCsrfToken();
      csrfHeaders = getCsrfHeaders();
    }
    if (!csrfHeaders['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token');

    const endpoint = complete
      ? '/api/applications/' + applicationId + '/pre-submission-meeting/submit'
      : '/api/applications/' + applicationId + '/pre-submission-meeting';
    const response = await fetch(buildBackendUrl(endpoint), {
      method: complete ? 'POST' : 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': generateCorrelationId(), ...csrfHeaders },
      body: JSON.stringify({ requested, complete, answer: meeting.answer, reason: meeting.reason }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      // Validation messages are written for the applicant; other failures use fixed copy.
      const message = response.status === 400 && typeof body.message === 'string'
        ? body.message
        : ERROR_MESSAGES[response.status] || DEFAULT_SAVE_ERROR;
      const error = new Error(message) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
};
