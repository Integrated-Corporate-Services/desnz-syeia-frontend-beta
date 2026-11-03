import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoNoticesService } from './cpoNoticesService';

vi.mock('../../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../../../../utils/csrf', () => ({
  getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }),
  fetchCsrfToken: vi.fn(),
}));

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

const serverState = {
  application_id: 'app-1',
  content_version: 13,
  record: {
    row_version: 2,
    requirements: { acknowledged: true },
    inspection: {
      addresses: [{
        inspection_address_id: 'addr-1',
        row_version: 2,
        address: { line1: 'Network House, 72 Guild Street', line2: null, town_city: 'London', county: null, postcode: 'SE23 6FH' },
        available_from: '2026-10-07',
      }],
    },
    'order-maps-website': { order_maps_url: 'https://old.example.gov.uk' },
    newspapers: { publications: [] },
    site: { most_recent_displayed_on: null, document_ids: [] },
    statement_of_service: { last_person_served_on: null, document_ids: [] },
    check: { confirmed: false },
  },
  documents: [{ document_id: 'doc-1', category: 'CPO_NEWSPAPER_NOTICES', filename: 'week-1.pdf' }],
  desnzReference: 'CPO-2026-0001',
  can_edit: true,
};

const serverFetch = (patchResponse?: () => Response) => vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => (
  init?.method === 'PATCH' && patchResponse ? patchResponse() : json(serverState)
));

describe('cpoNoticesService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('GETs /record-notices with credentials and maps the response to the internal model', async () => {
    const fetchMock = serverFetch();
    vi.stubGlobal('fetch', fetchMock);

    const result = await cpoNoticesService.get('app-1');

    expect(fetchMock.mock.calls[0][0]).toBe('/api/applications/app-1/record-notices');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
    expect(result.reference).toBe('CPO-2026-0001');
    expect(result.documents[0]).toMatchObject({ document_id: 'doc-1', file_id: 'doc-1', category: 'CPO_NEWSPAPER_NOTICES', filename: 'week-1.pdf' });
    expect(result.record.inspection?.addresses?.[0]).toMatchObject({ id: 'addr-1', from: '2026-10-07', line1: 'Network House, 72 Guild Street', line2: '', county: '', townCity: 'London', postcode: 'SE23 6FH' });
    expect(result.record.online?.url).toBe('https://old.example.gov.uk');
  });

  it('PATCHes only the changed page with the expected versions and CSRF token', async () => {
    const fetchMock = serverFetch(() => json(serverState));
    vi.stubGlobal('fetch', fetchMock);

    await cpoNoticesService.save('app-1', 'online', { format: 'reference', url: 'https://new.example.gov.uk' }, false);

    const patches = fetchMock.mock.calls.filter(([, init]) => init?.method === 'PATCH');
    expect(patches).toHaveLength(1);
    const [url, init] = patches[0];
    expect(url).toBe('/api/applications/app-1/record-notices');
    expect(init).toMatchObject({ credentials: 'include' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', 'X-CSRF-Token': 'test-token' });
    expect(JSON.parse(init.body)).toEqual({
      expected_content_version: 13,
      expected_row_version: 2,
      page_id: 'order-maps-website',
      data: { order_maps_url: 'https://new.example.gov.uk' },
    });
  });

  it('sends no PATCH when the page answers match the server state', async () => {
    const fetchMock = serverFetch();
    vi.stubGlobal('fetch', fetchMock);

    await cpoNoticesService.save('app-1', 'online', { format: 'reference', url: 'https://old.example.gov.uk' }, false);

    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'PATCH')).toHaveLength(0);
  });

  it.each([
    [401, 'session has expired'],
    [403, 'do not have permission'],
    [404, 'not found'],
    [409, 'This record has changed'],
    [500, 'Unable to load or save your publicity record'],
  ])('maps status %s to a user-facing message', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => json({ error: 'x' }, status)));

    await expect(cpoNoticesService.get('app-1')).rejects.toMatchObject({ message: expect.stringContaining(message), status });
  });

  it('shows the backend validation message for a 400', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => json({ error: 'Validation Error', message: 'Add at least one inspection address' }, 400)));
    await expect(cpoNoticesService.get('app-1')).rejects.toThrow('Add at least one inspection address');
  });
});
