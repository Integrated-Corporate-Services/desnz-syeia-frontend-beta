import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { markInAppNotificationRead } from './inAppNotificationsService';
import { fetchCsrfToken, getCsrfHeaders, getCsrfToken } from '../../../utils/csrf';

vi.mock('../../../utils/csrf', () => ({
  fetchCsrfToken: vi.fn(),
  getCsrfHeaders: vi.fn(),
  getCsrfToken: vi.fn(),
}));

vi.mock('../../../utils/apiConfig', () => ({
  getApiUrl: (path: string) => `http://api.test${path}`,
}));

const response = (status: number) => ({ ok: status >= 200 && status < 300, status }) as Response;

describe('markInAppNotificationRead', () => {
  const fetchMock = vi.fn();
  let token: string | null;

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    token = null;
    vi.mocked(getCsrfToken).mockImplementation(() => token);
    vi.mocked(getCsrfHeaders).mockImplementation(() => (token ? { 'X-CSRF-Token': token } : {}));
    vi.mocked(fetchCsrfToken).mockReset();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('fetches a CSRF token first when none is cached yet', async () => {
    vi.mocked(fetchCsrfToken).mockImplementation(async () => (token = 'token-1'));
    fetchMock.mockResolvedValue(response(204));

    expect(await markInAppNotificationRead('n-1')).toBe(true);

    expect(fetchCsrfToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/in-app-notifications/n-1/read', expect.objectContaining({
      method: 'PATCH',
      headers: { 'X-CSRF-Token': 'token-1' },
    }));
  });

  it('gets a new token and tries once more when the token is rejected', async () => {
    token = 'expired';
    vi.mocked(fetchCsrfToken).mockImplementation(async () => (token = 'fresh'));
    fetchMock.mockResolvedValueOnce(response(403)).mockResolvedValueOnce(response(204));

    expect(await markInAppNotificationRead('n-1')).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].headers).toEqual({ 'X-CSRF-Token': 'fresh' });
  });

  it('does not send the update without a token', async () => {
    vi.mocked(fetchCsrfToken).mockResolvedValue(null);

    expect(await markInAppNotificationRead('n-1')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
