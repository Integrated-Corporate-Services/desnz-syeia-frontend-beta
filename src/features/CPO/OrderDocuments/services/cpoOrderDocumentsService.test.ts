import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoOrderDocumentsService } from './cpoOrderDocumentsService';

vi.mock('../../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../../../../utils/csrf', () => ({
  getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }),
  fetchCsrfToken: vi.fn(),
}));

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('cpoOrderDocumentsService', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => vi.unstubAllGlobals());

  it('GETs the documents with credentials and adds the land answers from the local store', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ documents: [{ document_id: 'doc' }], canEdit: false }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await cpoOrderDocumentsService.get('app-1');

    expect(fetchMock.mock.calls[0][0]).toBe('/api/applications/app-1/order-documents');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
    expect(result).toEqual({ orderDetails: {}, documents: [{ document_id: 'doc' }], canEdit: false });
  });

  it('PUTs the step without a confirmation outside the check step, then refreshes progress', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ documents: [], canEdit: true }));
    vi.stubGlobal('fetch', fetchMock);

    await cpoOrderDocumentsService.save('app-1', 'order', false, null);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/applications/app-1/order-documents');
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', 'X-CSRF-Token': 'test-token' });
    expect(JSON.parse(init.body)).toEqual({ step: 'order', saveForLater: false });
  });

  it.each([[true, { step: 'check', saveForLater: false, confirmed: true }], [null, { step: 'check', saveForLater: false, confirmed: false }]])(
    'sends the check-step confirmation (%s)', async (confirmed, body) => {
      const fetchMock = vi.fn().mockResolvedValue(json({ documents: [] }));
      vi.stubGlobal('fetch', fetchMock);
      await cpoOrderDocumentsService.save('app-1', 'check', false, confirmed);
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(body);
    });

  it.each([
    [401, 'session has expired'],
    [403, 'do not have permission'],
    [404, 'not found'],
    [409, 'Only draft'],
    [500, 'Unable to load or save order documents'],
  ])('maps status %s to a user-facing message', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'x' }, status)));

    await expect(cpoOrderDocumentsService.save('app-1', 'order', true)).rejects.toMatchObject({ message: expect.stringContaining(message), status });
    await expect(cpoOrderDocumentsService.get('app-1')).rejects.toMatchObject({ status });
  });

  it('shows the backend validation message for a 400', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'Validation Error', message: 'Upload the statement of reasons' }, 400)));
    await expect(cpoOrderDocumentsService.save('app-1', 'reasons', false)).rejects.toThrow('Upload the statement of reasons');
  });
});
