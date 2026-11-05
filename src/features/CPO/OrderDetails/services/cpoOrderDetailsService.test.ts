import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoOrderDetailsService } from './cpoOrderDetailsService';

vi.mock('../../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../../../../utils/csrf', () => ({
  getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }),
  fetchCsrfToken: vi.fn(),
}));

const apiResponse = (overrides: Record<string, unknown> = {}) => ({
  application_id: 'app-1', content_version: 7, row_version: 2,
  order_name: 'North Ridge CPO', purpose: 'Acquire rights', can_edit: true, ...overrides,
});
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
let nextId = 0;
const newApp = () => `app-${++nextId}`;

describe('cpoOrderDetailsService', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => vi.unstubAllGlobals());

  it('GETs the order details with credentials and maps them to the page model', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(apiResponse()));
    vi.stubGlobal('fetch', fetchMock);
    const id = newApp();

    const result = await cpoOrderDetailsService.get(id);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api/applications/${id}/order-details`);
    expect(init).toMatchObject({ credentials: 'include' });
    expect(init.method).toBeUndefined();
    expect(result).toMatchObject({
      details: { orderName: 'North Ridge CPO', purpose: 'Acquire rights', relatedApplications: [] },
      documents: [], canEdit: true,
    });
  });

  it('PATCHes the order name with the versions from the last GET and the CSRF token', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(apiResponse()))
      .mockResolvedValueOnce(json(apiResponse({ content_version: 8, row_version: 3, order_name: 'New title' })));
    vi.stubGlobal('fetch', fetchMock);
    const id = newApp();

    await cpoOrderDetailsService.get(id);
    const result = await cpoOrderDetailsService.save(id, 'name', { orderName: 'New title' }, false);

    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe(`/api/applications/${id}/order-details`);
    expect(init).toMatchObject({ method: 'PATCH', credentials: 'include' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', 'X-CSRF-Token': 'test-token' });
    expect(JSON.parse(init.body)).toEqual({
      expected_content_version: 7, expected_row_version: 2, page_id: 'order-name', data: { order_name: 'New title' },
    });
    expect(result.details.orderName).toBe('New title');
  });

  it('uses the versions returned by the previous save on the next page', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(apiResponse()))
      .mockResolvedValueOnce(json(apiResponse({ content_version: 8, row_version: 3 })))
      .mockResolvedValueOnce(json(apiResponse({ content_version: 9, row_version: 4 })));
    vi.stubGlobal('fetch', fetchMock);
    const id = newApp();

    await cpoOrderDetailsService.get(id);
    await cpoOrderDetailsService.save(id, 'name', { orderName: 'Title' }, false);
    await cpoOrderDetailsService.save(id, 'purpose', { purpose: 'Acquire land' }, false);

    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({
      expected_content_version: 8, expected_row_version: 3, page_id: 'purpose', data: { purpose: 'Acquire land' },
    });
  });

  it('loads the versions first when saving before any GET', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(apiResponse()))
      .mockResolvedValueOnce(json(apiResponse({ content_version: 8, row_version: 3 })));
    vi.stubGlobal('fetch', fetchMock);
    const id = newApp();

    await cpoOrderDetailsService.save(id, 'purpose', { purpose: 'Acquire land' }, true);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].method).toBeUndefined();
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ expected_content_version: 7, expected_row_version: 2 });
  });

  it('sends a blank value when a field is cleared', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => json(apiResponse()));
    vi.stubGlobal('fetch', fetchMock);
    const id = newApp();

    await cpoOrderDetailsService.save(id, 'name', {}, true);

    expect(JSON.parse(fetchMock.mock.calls[1][1].body).data).toEqual({ order_name: '' });
  });

  it.each(['special-land', 'exchange-land', 'related-applications', 'check'])(
    'does not call the backend for the on-screen step %s',
    async (step) => {
      const fetchMock = vi.fn().mockResolvedValue(json(apiResponse()));
      vi.stubGlobal('fetch', fetchMock);
      const id = newApp();
      await cpoOrderDetailsService.get(id);
      fetchMock.mockClear();

      const result = await cpoOrderDetailsService.save(id, step, { includesSpecialLand: true }, false);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.details).toMatchObject({ orderName: 'North Ridge CPO', includesSpecialLand: true });
    }
  );

  it.each([
    [401, 'session has expired'],
    [403, 'do not have permission'],
    [404, 'Unable to load or save order details'],
    [500, 'Unable to load or save order details'],
  ])('maps status %s to a user-facing message', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'x' }, status)));

    await expect(cpoOrderDetailsService.save(newApp(), 'name', {}, true)).rejects.toMatchObject({ message: expect.stringContaining(message), status });
    await expect(cpoOrderDetailsService.get(newApp())).rejects.toMatchObject({ status });
  });

  it('shows the backend validation message for a 400', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(json(apiResponse()))
      .mockResolvedValueOnce(json({ error: 'Validation Error', message: 'The order title must be 500 characters or fewer' }, 400)));

    await expect(cpoOrderDetailsService.save(newApp(), 'name', { orderName: 'x' }, false)).rejects.toThrow('500 characters or fewer');
  });

  it('shows the backend stale-version message for a 409', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(json(apiResponse()))
      .mockResolvedValueOnce(json({ message: 'This page has changed since you opened it. Refresh the page and try again.' }, 409)));

    await expect(cpoOrderDetailsService.save(newApp(), 'name', { orderName: 'x' }, false))
      .rejects.toMatchObject({ message: expect.stringContaining('changed since you opened it'), status: 409 });
  });

  it('does not save without a CSRF token', async () => {
    vi.resetModules();
    vi.doMock('../../../../utils/csrf', () => ({ getCsrfHeaders: () => ({}), fetchCsrfToken: vi.fn() }));
    const { cpoOrderDetailsService: service } = await import('./cpoOrderDetailsService');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(service.save(newApp(), 'name', { orderName: 'x' }, false)).rejects.toThrow('Unable to obtain CSRF token');
    expect(fetchMock).not.toHaveBeenCalled();
    vi.doUnmock('../../../../utils/csrf');
  });
});
