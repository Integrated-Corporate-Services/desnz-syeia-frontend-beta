import { buildBackendUrl } from '../../../../utils/apiConfig';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import {
  CPO_MEETING_ANSWER_BY_CODE,
  CPO_MEETING_CODE_BY_ANSWER,
  type CpoMeeting,
  type CpoMeetingDetails,
  type CpoMeetingResponse,
  type CpoMeetingVersions,
} from '../types/preSubmissionMeeting';

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Sign in again before continuing.',
  403: 'You do not have permission to update this application. Refresh the page or contact support.',
  404: 'The meeting service or application is unavailable. Refresh the page or contact support.',
  409: 'This application can no longer be updated. Refresh the page.',
};
const DEFAULT_LOAD_ERROR = 'Unable to load your answer. Refresh the page to try again.';
const DEFAULT_SAVE_ERROR = 'Unable to save your pre-submission meeting answer. Try again.';
const PAGE_ID = 'meeting-answer';

const endpoint = (applicationId: string) => buildBackendUrl(`/api/applications/${applicationId}/pre-submission-meeting`);

const readMeeting = async (response: Response, fallback: string): Promise<CpoMeeting> => {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Validation and stale-version messages are written for the applicant; other failures use fixed copy.
    const message = (response.status === 400 || response.status === 409) && typeof body.message === 'string'
      ? body.message
      : ERROR_MESSAGES[response.status] || fallback;
    throw Object.assign(new Error(message), { status: response.status });
  }
  const meeting: CpoMeetingResponse = await response.json();
  return { ...meeting, answer: meeting.answer ? CPO_MEETING_ANSWER_BY_CODE[meeting.answer] : null };
};

export const cpoPreSubmissionMeetingService = {
  get: async (applicationId: string): Promise<CpoMeeting> =>
    readMeeting(await fetch(endpoint(applicationId), {
      credentials: 'include',
      headers: { 'X-Correlation-ID': generateCorrelationId() },
    }), DEFAULT_LOAD_ERROR),

  save: async (
    applicationId: string,
    versions: CpoMeetingVersions,
    meeting: CpoMeetingDetails,
    complete: boolean,
  ): Promise<CpoMeeting> => {
    let csrfHeaders = getCsrfHeaders();
    if (!csrfHeaders['X-CSRF-Token']) {
      await fetchCsrfToken();
      csrfHeaders = getCsrfHeaders();
    }
    if (!csrfHeaders['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token');

    return readMeeting(await fetch(endpoint(applicationId), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': generateCorrelationId(), ...csrfHeaders },
      body: JSON.stringify({
        expected_content_version: versions.content_version,
        expected_row_version: versions.row_version,
        page_id: PAGE_ID,
        data: {
          answer: meeting.answer === null ? null : CPO_MEETING_CODE_BY_ANSWER[meeting.answer],
          reason: meeting.reason,
          complete,
        },
      }),
    }), DEFAULT_SAVE_ERROR);
  },
};
