import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCsrfToken, getCsrfHeaders } from '../../utils/csrf';
import { EMPTY_ORDER_DETAILS } from './OrderDetails/constants/orderDetailsConstants';
import { cpoOrderDetailsService } from './OrderDetails/services/cpoOrderDetailsService';
import { cpoOrderDocumentsService } from './OrderDocuments/services/cpoOrderDocumentsService';
import { cpoNoticesService } from './RecordNotices/services/cpoNoticesService';
import { cpoTaskListService } from './TaskList/services/cpoTaskListService';
import { applicationApiService } from '../../services/applicationApiService';
import { progressApiService } from '../../services/progressApiService';

vi.mock('../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../../utils/csrf', () => ({
  getCsrfHeaders: vi.fn(),
  fetchCsrfToken: vi.fn(),
}));
vi.mock('../../services/applicationApiService', () => ({ applicationApiService: { getApplicationById: vi.fn() } }));
vi.mock('../../services/progressApiService', () => ({ progressApiService: { fetchApplicationProgress: vi.fn() } }));

const apiCases = [
  {
    path: 'order-details',
    method: 'PATCH',
    get: () => cpoOrderDetailsService.get('app-1'),
    save: () => cpoOrderDetailsService.save('app-1', 'name', { orderName: 'North Ridge CPO' }, false),
    body: { step: 'name', changes: { orderName: 'North Ridge CPO' }, saveForLater: false },
    response: { details: { ...EMPTY_ORDER_DETAILS, orderName: 'North Ridge CPO' }, documents: [], canEdit: true },
  },
  {
    path: 'order-documents',
    method: 'POST',
    get: () => cpoOrderDocumentsService.get('app-1'),
    save: () => cpoOrderDocumentsService.save('app-1', 'check', false, true),
    body: { step: 'check', saveForLater: false, confirmed: true },
    response: { orderDetails: { includesSpecialLand: true }, documents: [], canEdit: false },
  },
  {
    path: 'notices',
    method: 'PUT',
    get: () => cpoNoticesService.get('app-1'),
    save: () => cpoNoticesService.save('app-1', 'requirements', { acknowledged: true }, true),
    body: { step: 'requirements', answers: { acknowledged: true }, saveForLater: true },
    response: {
      record: { requirements: { acknowledged: true } }, documents: [], reference: 'CPO00001',
      objectionsEmail: 'objections@example.gov.uk', finalObjectionDate: '2026-11-05',
    },
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCsrfHeaders).mockReturnValue({ 'X-CSRF-Token': 'test-token' });
});
afterEach(() => vi.unstubAllGlobals());

describe.each(apiCases)('CPO $path API', ({ path, method, get, save, body, response }) => {
  it('loads backend data with session credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response)));
    vi.stubGlobal('fetch', fetchMock);

    await expect(get()).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`/api/applications/app-1/${path}`, { credentials: 'include' });
  });

  it('saves the expected payload with CSRF protection', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response)));
    vi.stubGlobal('fetch', fetchMock);

    await expect(save()).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`/api/applications/app-1/${path}`, {
      method, credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'test-token' },
      body: JSON.stringify(body),
    });
    expect(fetchCsrfToken).not.toHaveBeenCalled();
  });

  it('obtains a missing CSRF token before saving', async () => {
    vi.mocked(getCsrfHeaders).mockReturnValueOnce({});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response))));

    await expect(save()).resolves.toEqual(response);
    expect(fetchCsrfToken).toHaveBeenCalledOnce();
  });

  it('does not save without a CSRF token', async () => {
    vi.mocked(getCsrfHeaders).mockReturnValue({});
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(save()).rejects.toThrow('Unable to obtain CSRF token');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [400, 'Check your answer'],
    [401, 'session has expired'],
    [403, 'do not have permission'],
    [409, 'Only draft'],
    [404, 'Unable to load or save'],
    [500, 'Unable to load or save'],
  ])('rejects unsuccessful reads and saves with status %s', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () =>
      new Response(JSON.stringify({ message: 'Check your answer' }), { status })));

    await expect(get()).rejects.toThrow(message);
    await expect(save()).rejects.toThrow(message);
  });

  it('reports a missing route even if its error response is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Not found', { status: 404 })));
    await expect(get()).rejects.toThrow('Unable to load or save');
  });

  it('propagates network failures instead of using local data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));
    await expect(get()).rejects.toThrow('Network unavailable');
    await expect(save()).rejects.toThrow('Network unavailable');
  });
});

describe('CPO order document save payload', () => {
  it('omits confirmation for upload steps', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ orderDetails: {}, documents: [] })));
    vi.stubGlobal('fetch', fetchMock);

    await cpoOrderDocumentsService.save('app-1', 'order', true);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ step: 'order', saveForLater: true });
  });
});

describe('CPO task-list API', () => {
  it('loads the application and progress directly from the backend', async () => {
    const application = { application_id: 'app-1', type: 'CPO', desnz_ref: 'CPO00001' };
    const progress = [{ subsection_name: 'Pre-submission meeting', status: 'Completed' }];
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue(application);
    vi.mocked(progressApiService.fetchApplicationProgress).mockResolvedValue(progress);

    await expect(cpoTaskListService.load('app-1')).resolves.toEqual({ application, progress });
    expect(applicationApiService.getApplicationById).toHaveBeenCalledExactlyOnceWith('app-1');
    expect(progressApiService.fetchApplicationProgress).toHaveBeenCalledExactlyOnceWith('app-1');
  });

  it('rejects non-CPO applications', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'NWL' });
    vi.mocked(progressApiService.fetchApplicationProgress).mockResolvedValue([]);

    await expect(cpoTaskListService.load('app-1')).rejects.toThrow('Not a CPO application');
  });

  it('propagates progress failures rather than displaying local statuses', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'CPO' });
    vi.mocked(progressApiService.fetchApplicationProgress).mockRejectedValue(new Error('Progress unavailable'));

    await expect(cpoTaskListService.load('app-1')).rejects.toThrow('Progress unavailable');
  });
});
