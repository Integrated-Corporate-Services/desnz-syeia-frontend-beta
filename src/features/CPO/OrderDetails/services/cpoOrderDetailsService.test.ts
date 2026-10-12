import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoOrderDetailsService } from './cpoOrderDetailsService';
import { syncApplicantFromBackend } from '../../store/cpoApplicantSync';
import { useCpoStore } from '../../store/useCpoStore';
import { resetCpoStore } from '../../store/testHelpers';

vi.mock('../../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../../../../utils/csrf', () => ({
  getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }),
  fetchCsrfToken: vi.fn(),
}));
vi.mock('../../store/cpoApplicantSync', () => ({ syncApplicantFromBackend: vi.fn().mockResolvedValue(undefined) }));

const backendDetails = { orderName: 'North Ridge CPO', purpose: 'Acquire rights', includesSpecialLand: false, exchangeLand: null, hasRelatedApplications: null, relatedApplications: [] };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('cpoOrderDetailsService', () => {
  beforeEach(() => { vi.clearAllMocks(); resetCpoStore(); });
  afterEach(() => vi.unstubAllGlobals());

  it('GETs the order details with credentials, fills missing fields and mirrors them locally', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ details: { orderName: 'North Ridge CPO' }, documents: [{ document_id: 'doc' }], canEdit: false }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await cpoOrderDetailsService.get('app-1');

    expect(fetchMock.mock.calls[0][0]).toBe('/api/applications/app-1/order-details');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
    expect(result).toMatchObject({ canEdit: false, documents: [{ document_id: 'doc' }], details: { orderName: 'North Ridge CPO', purpose: '', relatedApplications: [] } });
    expect(useCpoStore.getState().applications['app-1'].orderDetails.orderName).toBe('North Ridge CPO');
  });

  it('PATCHes the step, changes and saveForLater with the CSRF token, then refreshes progress', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ details: backendDetails, documents: [], canEdit: true }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await cpoOrderDetailsService.save('app-1', 'name', { orderName: 'North Ridge CPO' }, false);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/applications/app-1/order-details');
    expect(init).toMatchObject({ method: 'PATCH', credentials: 'include' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', 'X-CSRF-Token': 'test-token' });
    expect(JSON.parse(init.body)).toEqual({ step: 'name', changes: { orderName: 'North Ridge CPO' }, saveForLater: false });
    expect(result.details.purpose).toBe('Acquire rights');
    expect(useCpoStore.getState().applications['app-1'].orderDetails.purpose).toBe('Acquire rights');
    expect(syncApplicantFromBackend).toHaveBeenCalledWith('app-1', true);
  });

  it.each([
    [401, 'session has expired'],
    [403, 'do not have permission'],
    [404, 'not found'],
    [409, 'Only draft'],
    [500, 'Unable to load or save order details'],
  ])('maps status %s to a user-facing message', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'x' }, status)));

    await expect(cpoOrderDetailsService.save('app-1', 'name', {}, true)).rejects.toMatchObject({ message: expect.stringContaining(message), status });
    await expect(cpoOrderDetailsService.get('app-1')).rejects.toMatchObject({ status });
    expect(syncApplicantFromBackend).not.toHaveBeenCalled();
  });

  it('shows the backend validation message for a 400', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'Validation Error', message: 'Enter the order title' }, 400)));

    await expect(cpoOrderDetailsService.save('app-1', 'name', { orderName: '' }, false)).rejects.toThrow('Enter the order title');
  });
});
