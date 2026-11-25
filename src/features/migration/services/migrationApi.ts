/**
 * The only module that talks to /api/admin/migration (PLAN.md section 2.1).
 * Every function resolves with the response body or rejects with a MigrationApiError,
 * so a change to the backend contract only needs a change here.
 *
 * JSON calls use axios (credentials and CSRF come from the interceptors in main.tsx).
 * The cases file is sent as a raw request body with fetch, because the backend streams it.
 */
import axios from 'axios';
import { getApiUrl } from '../../../utils/apiConfig';
import { fetchCsrfToken, getCsrfHeaders } from '../../../utils/csrf';
import { createLogger } from '../../../utils/logger';
import { BATCHES_PAGE_SIZE, MIGRATION_API_BASE, XLSX_MIME_TYPE } from '../constants';
import { MigrationApiError } from '../utils/errors';
import type {
  CasesFileUploadResult,
  CheckBatchIdResponse,
  MigratedApplicationResponse,
  MigrationBatchDetails,
  MigrationBatchListResponse,
  MigrationErrorBody,
  StartBatchResponse,
} from '../types';

const logger = createLogger('migrationApi');

const enc = encodeURIComponent;

export const migrationApiPaths = {
  checkBatchId: () => `${MIGRATION_API_BASE}/batches/check-id`,
  casesFile: (batchId: string) => `${MIGRATION_API_BASE}/batches/${enc(batchId)}/cases-file`,
  startBatch: (batchId: string) => `${MIGRATION_API_BASE}/batches/${enc(batchId)}/start`,
  batches: () => `${MIGRATION_API_BASE}/batches`,
  batch: (batchId: string) => `${MIGRATION_API_BASE}/batches/${enc(batchId)}`,
  application: (reference: string) => `${MIGRATION_API_BASE}/applications/${enc(reference)}`,
  documents: (applicationId: string) => `${MIGRATION_API_BASE}/applications/${enc(applicationId)}/documents`,
  document: (applicationId: string, documentId: string) =>
    `${MIGRATION_API_BASE}/applications/${enc(applicationId)}/documents/${enc(documentId)}`,
  completeDocuments: (applicationId: string) =>
    `${MIGRATION_API_BASE}/applications/${enc(applicationId)}/documents/complete`,
};

/**
 * Paths for FileUpload.tsx. FileUpload passes them to buildBackendUrl, so they include /api.
 */
export const migrationUploadEndpoints = (applicationId: string) => ({
  presignedUrl: `/api${migrationApiPaths.documents(applicationId)}/presigned-url`,
  confirm: `/api${migrationApiPaths.documents(applicationId)}/confirm`,
});

const toMigrationApiError = (error: unknown): MigrationApiError => {
  if (error instanceof MigrationApiError) return error;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const body = (error.response?.data ?? {}) as MigrationErrorBody;
    return new MigrationApiError(status, { code: body.error, serverMessage: body.message });
  }
  return new MigrationApiError(0);
};

async function call<T>(request: () => Promise<{ data: T }>, description: string): Promise<T> {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    const apiError = toMigrationApiError(error);
    logger.warn(`Migration API call failed: ${description}`, { status: apiError.status, code: apiError.code });
    throw apiError;
  }
}

export const checkBatchId = (batchId: string): Promise<CheckBatchIdResponse> =>
  call(() => axios.post<CheckBatchIdResponse>(getApiUrl(migrationApiPaths.checkBatchId()), { batchId }), 'check batch ID');

/** PUT the xlsx as the raw request body. */
export async function uploadCasesFile(batchId: string, file: File): Promise<CasesFileUploadResult> {
  let csrfHeaders = getCsrfHeaders();
  if (!csrfHeaders['X-CSRF-Token']) {
    await fetchCsrfToken();
    csrfHeaders = getCsrfHeaders();
  }

  const send = (headers: { 'X-CSRF-Token'?: string }) =>
    fetch(getApiUrl(migrationApiPaths.casesFile(batchId)), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': XLSX_MIME_TYPE,
        // Header values must be Latin-1, so the name is URI encoded. The backend decodes it.
        'X-File-Name': encodeURIComponent(file.name),
        ...headers,
      },
      body: file,
    });

  let response: Response;
  let body: MigrationErrorBody | null = null;
  try {
    response = await send(csrfHeaders);
    if (response.status === 403) {
      body = (await response.json().catch(() => ({}))) as MigrationErrorBody;
      if (/csrf/i.test(`${body.error ?? ''} ${body.message ?? ''}`)) {
        // The cached token was rejected: get a new one and try once more.
        await fetchCsrfToken();
        response = await send(getCsrfHeaders());
        body = null;
      }
    }
  } catch (error) {
    logger.warn('Cases file upload failed before a response', { error });
    throw new MigrationApiError(0);
  }

  if (!response.ok) {
    body = body ?? ((await response.json().catch(() => ({}))) as MigrationErrorBody);
    logger.warn('Cases file upload rejected', { status: response.status, code: body.error });
    throw new MigrationApiError(response.status, { code: body.error, serverMessage: body.message });
  }

  return (await response.json()) as CasesFileUploadResult;
}

export const startBatch = (batchId: string, uploadId: string): Promise<StartBatchResponse> =>
  call(() => axios.post<StartBatchResponse>(getApiUrl(migrationApiPaths.startBatch(batchId)), { uploadId }), 'start batch');

export const listBatches = (page: number, pageSize: number = BATCHES_PAGE_SIZE): Promise<MigrationBatchListResponse> =>
  call(
    () => axios.get<MigrationBatchListResponse>(getApiUrl(migrationApiPaths.batches()), { params: { page, pageSize } }),
    'list batches'
  );

export const getBatch = (batchId: string): Promise<MigrationBatchDetails> =>
  call(() => axios.get<MigrationBatchDetails>(getApiUrl(migrationApiPaths.batch(batchId))), 'get batch');

/** reference is a DESNZ reference or an application ID. */
export const getMigratedApplication = (reference: string): Promise<MigratedApplicationResponse> =>
  call(
    () => axios.get<MigratedApplicationResponse>(getApiUrl(migrationApiPaths.application(reference))),
    'get migrated application'
  );

export const markDocumentsComplete = (applicationId: string): Promise<unknown> =>
  call(() => axios.post(getApiUrl(migrationApiPaths.completeDocuments(applicationId))), 'mark documents complete');

/**
 * ASSUMPTION: the contract table has no remove route; decision Q6 allows removal of
 * documents added through these pages. DELETE /applications/:applicationId/documents/:documentId.
 */
export const removeDocument = (applicationId: string, documentId: string): Promise<unknown> =>
  call(() => axios.delete(getApiUrl(migrationApiPaths.document(applicationId, documentId))), 'remove document');
