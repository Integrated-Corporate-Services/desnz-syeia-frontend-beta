import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationApiService, SubmitApplicationError } from './applicationApiService';

const { mockFetchCsrfToken, mockGetCsrfHeaders } = vi.hoisted(() => ({
  mockFetchCsrfToken: vi.fn(),
  mockGetCsrfHeaders: vi.fn(),
}));

vi.mock('../utils/csrf', () => ({
  fetchCsrfToken: mockFetchCsrfToken,
  getCsrfHeaders: mockGetCsrfHeaders,
}));
vi.mock('../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../utils/correlationId', () => ({ generateCorrelationId: () => 'test-correlation-id' }));
vi.mock('../utils/logger', () => ({ createLogger: () => ({ debug: vi.fn(), error: vi.fn() }) }));

describe('applicationApiService.reassignApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCsrfHeaders.mockReturnValue({});
    mockFetchCsrfToken.mockResolvedValue(null);
    vi.stubGlobal('fetch', vi.fn());
  });

  it('does not send the reassignment mutation when CSRF token acquisition fails', async () => {
    await expect(applicationApiService.reassignApplication(
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
    )).rejects.toThrow('Unable to obtain CSRF token');

    expect(mockFetchCsrfToken).toHaveBeenCalledOnce();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows the nested operational backend error message', async () => {
    mockGetCsrfHeaders.mockReturnValue({ 'X-CSRF-Token': 'token' });
    vi.mocked(fetch).mockResolvedValue({ ok: false, json: async () => ({ error: { message: 'Selected user is not eligible for this application' } }) } as Response);
    await expect(applicationApiService.reassignApplication('application', 'assignee')).rejects.toThrow('Selected user is not eligible for this application');
    expect(fetch).toHaveBeenCalledWith('/api/applications/application/assignment', expect.objectContaining({ method: 'PATCH', headers: expect.objectContaining({ 'X-CSRF-Token': 'token', 'X-Correlation-ID': 'test-correlation-id' }) }));
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)).toEqual({ new_assignee_id: 'assignee' });
  });

  it('shows a meaningful fallback when the failed response is not JSON', async () => {
    mockGetCsrfHeaders.mockReturnValue({ 'X-CSRF-Token': 'token' });
    vi.mocked(fetch).mockResolvedValue({ ok: false, json: async () => { throw new Error('Invalid JSON'); } } as unknown as Response);
    await expect(applicationApiService.reassignApplication('application', 'assignee')).rejects.toThrow('Unable to reassign application. Try again later.');
  });
});

describe('applicationApiService.submitApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCsrfHeaders.mockReturnValue({ 'X-CSRF-Token': 'token' });
    mockFetchCsrfToken.mockResolvedValue(null);
    vi.stubGlobal('fetch', vi.fn());
  });

  it('throws SubmitApplicationError with the incomplete sections from a 400 response', async () => {
    const incompleteSections = [{ key: 'record-notices', label: 'Record your notices' }];
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 400, json: async () => ({ incompleteSections }) } as Response);

    const error = await applicationApiService.submitApplication('application').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(SubmitApplicationError);
    expect(error).toMatchObject({ status: 400, incompleteSections });
  });

  it('throws SubmitApplicationError with no sections when the failed response is not JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('Invalid JSON'); } } as unknown as Response);

    const error = await applicationApiService.submitApplication('application').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(SubmitApplicationError);
    expect(error).toMatchObject({ status: 500, incompleteSections: [] });
  });

  it('fetches a missing CSRF token and sends it with the submit request', async () => {
    mockGetCsrfHeaders.mockReturnValueOnce({}).mockReturnValue({ 'X-CSRF-Token': 'fresh-token' });
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200, json: async () => ({ status: 'SUBMITTED' }) } as Response);

    await expect(applicationApiService.submitApplication('application')).resolves.toEqual({ status: 'SUBMITTED' });

    expect(mockFetchCsrfToken).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith('/api/applications/application/submit', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      headers: expect.objectContaining({ 'X-CSRF-Token': 'fresh-token', 'X-Correlation-ID': 'test-correlation-id' }),
    }));
  });

  it('does not fetch a CSRF token when one is already held', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200, json: async () => ({}) } as Response);

    await applicationApiService.submitApplication('application');

    expect(mockFetchCsrfToken).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith('/api/applications/application/submit', expect.objectContaining({
      headers: expect.objectContaining({ 'X-CSRF-Token': 'token' }),
    }));
  });
});
