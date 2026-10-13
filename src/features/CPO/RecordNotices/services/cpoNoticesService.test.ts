import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoNoticesService } from './cpoNoticesService';
import { syncApplicantFromBackend } from '../../store/cpoApplicantSync';

vi.mock('../../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../../../../utils/csrf', () => ({
  getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }),
  fetchCsrfToken: vi.fn(),
}));
vi.mock('../../store/cpoApplicantSync', () => ({ syncApplicantFromBackend: vi.fn().mockResolvedValue(undefined) }));

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('cpoNoticesService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('GETs the publicity record with credentials and fills missing fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ record: { online: { url: 'https://example.gov.uk' } }, canEdit: false }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await cpoNoticesService.get('app-1');

    expect(fetchMock.mock.calls[0][0]).toBe('/api/applications/app-1/notices');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
    expect(result).toEqual({
      record: { online: { url: 'https://example.gov.uk' } }, documents: [], reference: '', objectionsEmail: '', finalObjectionDate: null, canEdit: false,
    });
  });

  it('PUTs the step, answers and saveForLater with the CSRF token, then refreshes progress', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ record: {}, documents: [], canEdit: true }));
    vi.stubGlobal('fetch', fetchMock);

    await cpoNoticesService.save('app-1', 'online', { format: 'reference', url: 'https://example.gov.uk' }, true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/applications/app-1/notices');
    expect(init).toMatchObject({ method: 'PUT', credentials: 'include' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', 'X-CSRF-Token': 'test-token' });
    expect(JSON.parse(init.body)).toEqual({ step: 'online', answers: { format: 'reference', url: 'https://example.gov.uk' }, saveForLater: true });
    expect(syncApplicantFromBackend).toHaveBeenCalledWith('app-1', true);
  });

  it.each([
    [401, 'session has expired'],
    [403, 'do not have permission'],
    [404, 'not found'],
    [409, 'Only draft'],
    [500, 'Unable to load or save your publicity record'],
  ])('maps status %s to a user-facing message without syncing progress', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'x' }, status)));

    await expect(cpoNoticesService.save('app-1', 'check', { format: 'reference', confirmed: true }, false)).rejects.toMatchObject({ message: expect.stringContaining(message), status });
    await expect(cpoNoticesService.get('app-1')).rejects.toMatchObject({ status });
    expect(syncApplicantFromBackend).not.toHaveBeenCalled();
  });

  it('shows the backend validation message for a 400', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'Validation Error', message: 'Add at least one inspection address' }, 400)));
    await expect(cpoNoticesService.save('app-1', 'inspection', { format: 'reference', addresses: [] }, false)).rejects.toThrow('Add at least one inspection address');
  });
});
