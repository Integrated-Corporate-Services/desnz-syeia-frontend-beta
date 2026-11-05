import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoPreSubmissionMeetingService } from './cpoPreSubmissionMeetingService';

vi.mock('../../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../../../../utils/csrf', () => ({
  getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }),
  fetchCsrfToken: vi.fn(),
}));

const versions = { content_version: 7, row_version: 2 };
const meeting = { answer: 'No, I don’t need this meeting' as const, reason: 'The project does not require a meeting at this stage.' };
const resource = {
  application_id: 'app-1', answer: 'not-needed', reason: meeting.reason, content_version: 8, row_version: 3,
  desnz_ref: 'CPO00001', requested_at: null, completed_at: null, can_edit: true,
};

describe('cpoPreSubmissionMeetingService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('GETs the meeting with credentials and maps the answer code to its label', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(resource), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(cpoPreSubmissionMeetingService.get('app-1')).resolves.toMatchObject({
      answer: 'No, I don’t need this meeting', reason: meeting.reason, content_version: 8, row_version: 3,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/cpo/app-1/pre-submission-meeting');
    expect(init).toMatchObject({ credentials: 'include' });
    expect(init.method).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps an unanswered meeting as null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...resource, answer: null, reason: '' }), { status: 200 })));

    await expect(cpoPreSubmissionMeetingService.get('app-1')).resolves.toMatchObject({ answer: null, reason: '' });
  });

  it('PATCHes the versions, page id and answer code with credentials and the CSRF token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(resource), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(cpoPreSubmissionMeetingService.save('app-1', versions, meeting, true)).resolves.toMatchObject({ content_version: 8, row_version: 3 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/cpo/app-1/pre-submission-meeting');
    expect(init).toMatchObject({ method: 'PATCH', credentials: 'include' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', 'X-CSRF-Token': 'test-token' });
    expect(JSON.parse(init.body)).toEqual({
      expected_content_version: 7,
      expected_row_version: 2,
      page_id: 'meeting-answer',
      data: { answer: 'not-needed', reason: meeting.reason, complete: true },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sends a null answer when saving an unanswered draft for later', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...resource, answer: null }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await cpoPreSubmissionMeetingService.save('app-1', { content_version: 1, row_version: 0 }, { answer: null, reason: '' }, false);

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      expected_content_version: 1, expected_row_version: 0, page_id: 'meeting-answer',
      data: { answer: null, reason: '', complete: false },
    });
  });

  it.each([
    [401, 'session has expired'],
    [403, 'do not have permission'],
    [404, 'unavailable'],
    [409, 'This application can no longer be updated'],
    [500, 'Unable to save your pre-submission meeting answer'],
  ])('maps save status %s to a user-facing message', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'x' }), { status })));

    await expect(cpoPreSubmissionMeetingService.save('app-1', versions, meeting, true)).rejects.toMatchObject({
      message: expect.stringContaining(message), status,
    });
  });

  it('shows the backend validation message for a 400', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Validation Error', message: "Tell us why you don't need this meeting" }), { status: 400 })));

    await expect(cpoPreSubmissionMeetingService.save('app-1', versions, { answer: 'No, I don’t need this meeting', reason: '' }, true))
      .rejects.toThrow("Tell us why you don't need this meeting");
  });

  it('shows the backend stale-version message for a 409', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'This page has changed since you opened it. Refresh the page and try again.' }), { status: 409 })));

    await expect(cpoPreSubmissionMeetingService.save('app-1', versions, meeting, true))
      .rejects.toMatchObject({ message: expect.stringContaining('changed since you opened it'), status: 409 });
  });

  it('uses a load-specific message when the GET fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));

    await expect(cpoPreSubmissionMeetingService.get('app-1')).rejects.toThrow('Unable to load your answer');
  });
});
