import { buildBackendUrl } from '../../../../utils/apiConfig';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import type { CpoMeetingDetails } from '../types/preSubmissionMeeting';

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Sign in again before saving your answer.',
  403: 'You do not have permission to update this application. Refresh the page or contact support.',
  404: 'The meeting service or application is unavailable. Refresh the page or contact support.',
  409: 'This application can no longer be updated or its meeting request has already been submitted. Refresh the page.',
};

export const cpoPreSubmissionMeetingService = {
  save: async (applicationId: string, requested: boolean | null, complete: boolean, meeting?: CpoMeetingDetails) => {
    let csrfHeaders = getCsrfHeaders();
    if (!csrfHeaders['X-CSRF-Token']) {
      await fetchCsrfToken();
      csrfHeaders = getCsrfHeaders();
    }
    if (!csrfHeaders['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token');
    const response = await fetch(
      buildBackendUrl(`/api/applications/${applicationId}/pre-submission-meeting`),
      {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders },
        body: JSON.stringify({ requested, complete, ...meeting }),
      },
    );
    if (!response.ok) {
      const error = new Error(ERROR_MESSAGES[response.status] || 'Unable to save your pre-submission meeting answer. Try again.') as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
};
