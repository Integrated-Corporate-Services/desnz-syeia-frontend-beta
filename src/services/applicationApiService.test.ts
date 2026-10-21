import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationApiService } from './applicationApiService';

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
      'Covering absence',
    )).rejects.toThrow('Unable to obtain CSRF token');

    expect(mockFetchCsrfToken).toHaveBeenCalledOnce();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows the nested operational backend error message', async () => {
    mockGetCsrfHeaders.mockReturnValue({ 'X-CSRF-Token': 'token' });
    vi.mocked(fetch).mockResolvedValue({ ok: false, json: async () => ({ error: { message: 'Selected user is not eligible for this application' } }) } as Response);
    await expect(applicationApiService.reassignApplication('application', 'assignee', 'Covering absence')).rejects.toThrow('Selected user is not eligible for this application');
    expect(fetch).toHaveBeenCalledWith('/api/applications/application/assignment', expect.objectContaining({ method: 'PATCH', headers: expect.objectContaining({ 'X-CSRF-Token': 'token', 'X-Correlation-ID': 'test-correlation-id' }) }));
  });

  it('shows a meaningful fallback when the failed response is not JSON', async () => {
    mockGetCsrfHeaders.mockReturnValue({ 'X-CSRF-Token': 'token' });
    vi.mocked(fetch).mockResolvedValue({ ok: false, json: async () => { throw new Error('Invalid JSON'); } } as unknown as Response);
    await expect(applicationApiService.reassignApplication('application', 'assignee', 'Covering absence')).rejects.toThrow('Unable to reassign application. Try again later.');
  });
});
