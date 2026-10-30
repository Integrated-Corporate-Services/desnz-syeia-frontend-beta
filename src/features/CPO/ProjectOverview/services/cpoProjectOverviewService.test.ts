import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoProjectOverviewService } from './cpoProjectOverviewService';

vi.mock('../../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../../../../utils/csrf', () => ({
  getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }),
  fetchCsrfToken: vi.fn(),
}));

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('cpoProjectOverviewService', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => vi.unstubAllGlobals());

  it('GETs the project overview with credentials and fills missing fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ details: { projectName: 'North Ridge' }, canEdit: true }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await cpoProjectOverviewService.get('app-1');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/applications/app-1/project-overview');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
    expect(result).toEqual({ details: { projectName: 'North Ridge', projectSummary: '' }, canEdit: true });
  });

  it('POSTs the answers with the CSRF token', async () => {
    const details = { projectName: 'North Ridge', projectSummary: 'Summary' };
    const fetchMock = vi.fn().mockResolvedValue(json({ details, canEdit: true }));
    vi.stubGlobal('fetch', fetchMock);
    await cpoProjectOverviewService.save('app-1', details);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': 'test-token' }, body: JSON.stringify(details),
    });
  });

  it.each([
    [400, { message: 'Summarise the project' }, 'Summarise the project'],
    [401, {}, 'Your session has expired. Sign in again.'],
    [409, {}, 'Only draft compulsory purchase order applications can be updated.'],
  ])('maps a %s response to a readable error', async (status, body, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(body, status)));
    await expect(cpoProjectOverviewService.get('app-1')).rejects.toThrow(message);
  });
});
