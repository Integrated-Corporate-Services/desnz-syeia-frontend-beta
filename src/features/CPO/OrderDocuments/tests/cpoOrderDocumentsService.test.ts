import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoOrderDocumentsService } from '../services/cpoOrderDocumentsService';

vi.mock('../../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../../../../utils/csrf', () => ({
  getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }),
  fetchCsrfToken: vi.fn(),
}));

const doc = (id: string, category: string) => ({
  document_id: `doc-${id}`, category, filename: `${id}.pdf`, file_size_bytes: 245678, uploaded_at: '2026-10-17T10:15:00Z',
  file_id: id, s3_key: `key/${id}`, file_content_type: 'application/pdf', added_by: 'user', added_at: '2026-10-17T10:00:00Z',
});
const api = (documents: unknown[], contentVersion = 7) => ({ application_id: 'app', content_version: contentVersion, documents, can_edit: true });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const respond = (...bodies: Array<[unknown, number?]>) => {
  const queue = [...bodies];
  return vi.fn().mockImplementation(async () => { const [body, status] = queue.shift() ?? [{}, 200]; return json(body, status); });
};
let nextId = 0;
const newApp = () => `app-${++nextId}`;
const full = [doc('f1', 'CPO_ORDER_DOCUMENTS'), doc('f2', 'CPO_ORDER_DOCUMENTS'), doc('f3', 'CPO_STATEMENT_OF_REASONS')];

describe('cpoOrderDocumentsService', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => vi.unstubAllGlobals());

  it('GETs the documents with credentials and maps them to the page model', async () => {
    const fetchMock = respond([api([doc('f1', 'CPO_ORDER_DOCUMENTS')])]);
    vi.stubGlobal('fetch', fetchMock);
    const id = newApp();

    const result = await cpoOrderDocumentsService.get(id);

    expect(fetchMock.mock.calls[0][0]).toBe(`/api/cpo/${id}/order-documents`);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
    expect(result.orderDetails).toEqual({});
    expect(result.documents[0]).toMatchObject({
      document_id: 'doc-f1', application_id: 'app', uploaded_at_timestamp: '2026-10-17T10:15:00Z', s3_key: 'key/f1',
    });
  });

  it('refreshes first, then PATCHes the page documents with the content version and CSRF token', async () => {
    const fetchMock = respond([api(full, 7)], [api(full, 8)]);
    vi.stubGlobal('fetch', fetchMock);
    const id = newApp();

    await cpoOrderDocumentsService.save(id, 'order', false);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe(`/api/cpo/${id}/order-documents`);
    expect(init).toMatchObject({ method: 'PATCH', credentials: 'include' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', 'X-CSRF-Token': 'test-token' });
    expect(JSON.parse(init.body)).toEqual({
      expected_content_version: 7, page_id: 'order',
      data: { documents: [
        { document_id: 'doc-f1', category: 'CPO_ORDER_DOCUMENTS' },
        { document_id: 'doc-f2', category: 'CPO_ORDER_DOCUMENTS' },
      ] },
    });
  });

  it('saves a page for later without requiring its files', async () => {
    const fetchMock = respond([api([])], [api([])]);
    vi.stubGlobal('fetch', fetchMock);

    await cpoOrderDocumentsService.save(newApp(), 'reasons', true);

    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ page_id: 'reasons', data: { documents: [] } });
  });

  it.each([
    ['order', [doc('f1', 'CPO_ORDER_DOCUMENTS')], 'certified order and at least one order map'],
    ['reasons', [], 'Upload the statement of reasons'],
    ['check', [doc('f1', 'CPO_ORDER_DOCUMENTS')], 'certified order and at least one order map'],
  ] as const)('blocks Continue on %s when required files are missing, without a PATCH', async (step, documents, message) => {
    const fetchMock = respond([api([...documents])]);
    vi.stubGlobal('fetch', fetchMock);

    await expect(cpoOrderDocumentsService.save(newApp(), step, false, true)).rejects.toThrow(message);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('needs the confirmation on the check step and then makes no PATCH', async () => {
    const fetchMock = respond([api(full)], [api(full)]);
    vi.stubGlobal('fetch', fetchMock);

    await expect(cpoOrderDocumentsService.save(newApp(), 'check', false, null)).rejects.toThrow('Select yes');
    await expect(cpoOrderDocumentsService.save(newApp(), 'check', false, true)).resolves.toMatchObject({ documents: expect.any(Array) });
    expect(fetchMock.mock.calls.every(([, init]) => init?.method !== 'PATCH')).toBe(true);
  });

  it.each([
    [400, 'Select documents uploaded to this application'],
    [409, 'This page has changed since you opened it.'],
  ])('shows the backend message for a %s on save', async (status, message) => {
    vi.stubGlobal('fetch', respond([api(full)], [{ message }, status]));
    await expect(cpoOrderDocumentsService.save(newApp(), 'order', false)).rejects.toMatchObject({ message, status });
  });

  it.each([
    [401, 'session has expired'],
    [403, 'do not have permission'],
    [404, 'not found'],
    [500, 'Unable to load or save'],
  ])('maps status %s to a user-facing message', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => json({ error: 'x' }, status)));
    await expect(cpoOrderDocumentsService.get(newApp())).rejects.toMatchObject({ message: expect.stringContaining(message), status });
  });

  it('shows the backend validation message for a 400', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'Validation Error', message: 'Upload at least one document related to the statement of reasons' }, 400)));
    await expect(cpoOrderDocumentsService.save('app-1', 'reasons', false)).rejects.toThrow('Upload at least one document related to the statement of reasons');
  });
});
