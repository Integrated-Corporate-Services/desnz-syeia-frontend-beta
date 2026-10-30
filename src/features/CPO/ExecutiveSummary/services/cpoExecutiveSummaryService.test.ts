import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoExecutiveSummaryService } from './cpoExecutiveSummaryService';

vi.mock('../../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../../../../utils/csrf', () => ({
  getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }),
  fetchCsrfToken: vi.fn(),
}));

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('cpoExecutiveSummaryService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('GETs the documents with credentials and defaults edit rights', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ documents: [{ document_id: 'doc' }] }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(cpoExecutiveSummaryService.get('app-1')).resolves.toEqual({ documents: [{ document_id: 'doc' }] });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/applications/app-1/executive-summary');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
  });

  it('PUTs saveForLater with the CSRF token, then refreshes progress', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ documents: [], canEdit: true }));
    vi.stubGlobal('fetch', fetchMock);

    await cpoExecutiveSummaryService.save('app-1', false);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/applications/app-1/executive-summary');
    expect(init).toMatchObject({ method: 'PUT', credentials: 'include' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', 'X-CSRF-Token': 'test-token' });
    expect(JSON.parse(init.body)).toEqual({ saveForLater: false });
  });

  it.each([
    [401, 'session has expired'],
    [403, 'do not have permission'],
    [404, 'not found'],
    [409, 'Only draft'],
    [500, 'Unable to load or save the executive summary'],
  ])('maps status %s to a user-facing message', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'x' }, status)));

    await expect(cpoExecutiveSummaryService.save('app-1', true)).rejects.toMatchObject({ message: expect.stringContaining(message), status });
    await expect(cpoExecutiveSummaryService.get('app-1')).rejects.toMatchObject({ status });
  });

  it('shows the backend message when the summary cannot be completed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'Bad Request', message: 'Upload an executive summary and wait for the virus check to finish' }, 400)));
    await expect(cpoExecutiveSummaryService.save('app-1', false)).rejects.toThrow('Upload an executive summary');
  });

  it('points the template link at the backend DOCX endpoint', () => {
    expect(cpoExecutiveSummaryService.templateUrl('app-1')).toBe('/api/applications/app-1/executive-summary/template');
  });
});
