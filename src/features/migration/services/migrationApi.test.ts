import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));
const csrfMock = vi.hoisted(() => ({
  token: 'csrf-1' as string | null,
  fetchCsrfToken: vi.fn(),
}));

vi.mock('axios', () => ({ default: axiosMock }));
vi.mock('../../../utils/csrf', () => ({
  getCsrfHeaders: () => (csrfMock.token ? { 'X-CSRF-Token': csrfMock.token } : {}),
  fetchCsrfToken: csrfMock.fetchCsrfToken,
}));

import {
  checkBatchId,
  getBatch,
  getMigratedApplication,
  listBatches,
  markDocumentsComplete,
  migrationUploadEndpoints,
  removeDocument,
  startBatch,
  uploadCasesFile,
} from './migrationApi';
import { MigrationApiError } from '../utils/errors';
import { XLSX_MIME_TYPE } from '../constants';

const axiosError = (status: number, data: unknown) => ({ isAxiosError: true, response: { status, data } });

describe('migrationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    csrfMock.token = 'csrf-1';
  });

  it('checks a batch ID with POST /admin/migration/batches/check-id', async () => {
    axiosMock.post.mockResolvedValue({ data: { available: true } });
    await expect(checkBatchId('INP-1')).resolves.toEqual({ available: true });
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringMatching(/\/api\/admin\/migration\/batches\/check-id$/), {
      batchId: 'INP-1',
    });
  });

  it('turns a 409 { error, message } into a MigrationApiError', async () => {
    axiosMock.post.mockRejectedValue(axiosError(409, { error: 'BATCH_EXISTS', message: 'Batch ID already used' }));
    const error = await checkBatchId('INP-1').catch((e) => e);
    expect(error).toBeInstanceOf(MigrationApiError);
    expect(error).toMatchObject({ status: 409, code: 'BATCH_EXISTS', serverMessage: 'Batch ID already used' });
  });

  it('turns a network error into status 0', async () => {
    axiosMock.get.mockRejectedValue(new Error('Network Error'));
    await expect(getBatch('INP-1')).rejects.toMatchObject({ status: 0 });
  });

  it('starts a batch with the upload ID', async () => {
    axiosMock.post.mockResolvedValue({ data: { batchId: 'INP-1', manifestKey: 'migrations/INP-1/manifest.json' } });
    await startBatch('INP-1', 'upload-1');
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringMatching(/\/batches\/INP-1\/start$/), { uploadId: 'upload-1' });
  });

  it('lists batches with page and pageSize', async () => {
    axiosMock.get.mockResolvedValue({ data: { batches: [], page: 2, pageSize: 20, total: 0 } });
    await listBatches(2);
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringMatching(/\/admin\/migration\/batches$/), {
      params: { page: 2, pageSize: 20 },
    });
  });

  it('encodes the reference when loading a migrated application', async () => {
    axiosMock.get.mockResolvedValue({ data: {} });
    await getMigratedApplication('NWL/2025 1');
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringMatching(/\/applications\/NWL%2F2025%201$/));
  });

  it('marks documents complete and removes a document', async () => {
    axiosMock.post.mockResolvedValue({ data: {} });
    axiosMock.delete.mockResolvedValue({ data: {} });
    await markDocumentsComplete('app-1');
    await removeDocument('app-1', 'doc-1');
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringMatching(/\/applications\/app-1\/documents\/complete$/));
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringMatching(/\/applications\/app-1\/documents\/doc-1$/));
  });

  it('gives FileUpload backend paths that include /api', () => {
    expect(migrationUploadEndpoints('app-1')).toEqual({
      presignedUrl: '/api/admin/migration/applications/app-1/documents/presigned-url',
      confirm: '/api/admin/migration/applications/app-1/documents/confirm',
    });
  });

  describe('uploadCasesFile', () => {
    const file = new File(['xlsx'], 'cases £.xlsx', { type: XLSX_MIME_TYPE });

    it('PUTs the raw file with credentials, CSRF, content type and file name headers', async () => {
      const result = { uploadId: 'u1', caseCount: 1 };
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(result), { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      await expect(uploadCasesFile('INP-1', file)).resolves.toEqual(result);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toMatch(/\/api\/admin\/migration\/batches\/INP-1\/cases-file$/);
      expect(init).toMatchObject({
        method: 'PUT',
        credentials: 'include',
        body: file,
        headers: {
          'Content-Type': XLSX_MIME_TYPE,
          'X-File-Name': encodeURIComponent('cases £.xlsx'),
          'X-CSRF-Token': 'csrf-1',
        },
      });
      vi.unstubAllGlobals();
    });

    it('fetches a CSRF token first when none is cached', async () => {
      csrfMock.token = null;
      csrfMock.fetchCsrfToken.mockImplementation(async () => {
        csrfMock.token = 'fresh';
        return 'fresh';
      });
      const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);
      await uploadCasesFile('INP-1', file);
      expect(csrfMock.fetchCsrfToken).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][1].headers['X-CSRF-Token']).toBe('fresh');
      vi.unstubAllGlobals();
    });

    it('rejects with the server message on 400', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ error: 'NO_CASES', message: 'The selected file has no cases' }), { status: 400 })
        )
      );
      await expect(uploadCasesFile('INP-1', file)).rejects.toMatchObject({
        status: 400,
        code: 'NO_CASES',
        serverMessage: 'The selected file has no cases',
      });
      vi.unstubAllGlobals();
    });

    it('rejects with status 0 when the request fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
      await expect(uploadCasesFile('INP-1', file)).rejects.toMatchObject({ status: 0 });
      vi.unstubAllGlobals();
    });
  });
});
