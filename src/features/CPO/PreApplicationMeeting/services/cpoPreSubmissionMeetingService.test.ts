import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoPreSubmissionMeetingService } from './cpoPreSubmissionMeetingService';

vi.mock('../../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../../../../utils/csrf', () => ({
  getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }),
  fetchCsrfToken: vi.fn(),
}));

const meeting = { answer: 'request-meeting' as const, reason: '' };

describe('cpoPreSubmissionMeetingService.save', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('PUTs the answer with credentials and the CSRF token and returns the saved application', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ application_id: 'app-1' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(cpoPreSubmissionMeetingService.save('app-1', true, true, meeting)).resolves.toEqual({ application_id: 'app-1' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/applications/app-1/pre-submission-meeting');
    expect(init).toMatchObject({ method: 'PUT', credentials: 'include' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', 'X-CSRF-Token': 'test-token' });
    expect(JSON.parse(init.body)).toEqual({ requested: true, complete: true, answer: 'request-meeting', reason: '' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sends an empty answer when saving an unanswered draft', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await cpoPreSubmissionMeetingService.save('app-1', null, false);

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ requested: null, complete: false, answer: null, reason: '' });
  });

  it.each([
    [401, 'session has expired'],
    [403, 'do not have permission'],
    [404, 'unavailable'],
    [409, 'meeting request has already been submitted'],
    [500, 'Unable to save your pre-submission meeting answer'],
  ])('maps status %s to a user-facing message', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'x' }), { status })));

    await expect(cpoPreSubmissionMeetingService.save('app-1', true, true, meeting)).rejects.toMatchObject({
      message: expect.stringContaining(message), status,
    });
  });

  it('shows the backend validation message for a 400', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Validation Error', message: "Tell us why you don't need this meeting" }), { status: 400 })));

    await expect(cpoPreSubmissionMeetingService.save('app-1', false, true, { answer: 'not-needed', reason: '' }))
      .rejects.toThrow("Tell us why you don't need this meeting");
  });
});
