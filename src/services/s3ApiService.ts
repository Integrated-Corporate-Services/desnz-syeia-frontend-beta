// S3 API Service for presigned URL and upload
// Presigned URLs expire after 30 minutes (configured on backend)
// URLs are cached in-memory to reduce backend calls

import { buildBackendUrl } from '../utils/apiConfig';
import { fetchCsrfToken, getCsrfToken, getCsrfHeaders } from '../utils/csrf';

// Configuration from environment variables
const S3_URL_EXPIRY_SECONDS = Number(import.meta.env.VITE_S3_URL_EXPIRY_SECONDS) || 1800; // Default: 30 minutes
const S3_REFRESH_BEFORE_EXPIRY_SECONDS = Number(import.meta.env.VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS) || 120; // Default: 2 minutes

async function csrfJsonHeaders(): Promise<Record<string, string>> {
  // Reuse the cached CSRF token to avoid an extra round-trip on every request;
  // only hit /csrf-token when we don't yet have one.
  let token = getCsrfToken();
  if (!token) {
    token = await fetchCsrfToken();
  }
  if (!token) {
    throw new Error('Unable to obtain a security token. Please refresh the page and try again.');
  }
  return {
    'Content-Type': 'application/json',
    ...getCsrfHeaders(),
  };
}

/**
 * Build a user-facing Error from a failed API response.
 * Parses JSON when available; never leaks SyntaxError/parse failures to the UI.
 */
async function errorFromFailedResponse(
  res: Response,
  fallbackMessage: string,
  pickMessage?: (body: Record<string, unknown>) => string | undefined
): Promise<Error> {
  let body: Record<string, unknown> | null = null;
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch (parseError) {
    return new Error(fallbackMessage, {
      cause: parseError instanceof Error ? parseError : undefined,
    });
  }

  const picked = pickMessage?.(body);
  if (picked) {
    return new Error(picked);
  }

  const userMessage = typeof body.userMessage === 'string' ? body.userMessage : undefined;
  const message = typeof body.message === 'string' ? body.message : undefined;
  const error = typeof body.error === 'string' ? body.error : undefined;
  return new Error(userMessage || message || error || fallbackMessage);
}

interface UrlCacheEntry {
  url: string;
  expiresAt: number;
}

// In-memory cache for presigned URLs
const urlCache = new Map<string, UrlCacheEntry>();

/**
 * Clear cached URL
 * Call this when component unmounts or when you need to invalidate cache
 */
export function clearPresignedUrlCache(filename?: string) {
  if (filename) {
    urlCache.delete(filename);
  } else {
    // Clear all caches
    urlCache.clear();
  }
}

export async function getPresignedUrls(files: { filename: string; contentType: string }[]) {
  const res = await fetch(buildBackendUrl('/api/upload/presigned-url'), {
    method: 'POST',
    headers: await csrfJsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ files })
  });
  
  if (!res.ok) {
    throw await errorFromFailedResponse(res, 'Failed to get presigned URLs', (body) => {
      if (body.code === 'CREDENTIALS_EXPIRED') {
        return (
          (typeof body.userMessage === 'string' && body.userMessage) ||
          'File upload service is temporarily unavailable. Please try again in a few minutes or contact support.'
        );
      }
      const error = typeof body.error === 'string' ? body.error : undefined;
      const userMessage = typeof body.userMessage === 'string' ? body.userMessage : undefined;
      return error || userMessage;
    });
  }
  
  return await res.json();
}

export async function uploadFileToS3(url: string, file: File) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file
  });
  return res;
}

export async function confirmUpload(
  params: {
    s3Key: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    etag?: string;
    applicationId: string;
    category: string;
    addedBy: string;
    subCategory?: string;
    consultationId?: string;
  },
  options?: { signal?: AbortSignal }
): Promise<{
  documentId: string;
  fileId: string;
  fileName: string;
  s3Key: string;
  bucketName: string;
  virtualFolder: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  status: string;
  etag?: string;
  scanStatus: string;
  scanResult: string | null;
  virusName: string | null;
  scannedAt: string | null;
  userMessage: string;
  downloadAllowed: boolean;
}> {
  const res = await fetch(buildBackendUrl('/api/upload/confirm'), {
    method: 'POST',
    headers: await csrfJsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(params),
    signal: options?.signal,
  });
  
  if (!res.ok) {
    throw await errorFromFailedResponse(res, 'Failed to confirm file upload');
  }
  
  return await res.json();
}

export async function getFileScanStatus(fileId: string): Promise<{
  fileId: string;
  s3Key: string;
  bucketName: string;
  scanStatus: string;
  scanResult: string | null;
  virusName: string | null;
  scannedAt: string | null;
  userMessage: string;
  downloadAllowed?: boolean;
}> {
  const res = await fetch(buildBackendUrl(`/api/files/${encodeURIComponent(fileId)}/scan-status`), {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    throw await errorFromFailedResponse(res, 'Failed to fetch scan status');
  }

  return await res.json();
}

export type FileScanStatusResult = Awaited<ReturnType<typeof getFileScanStatus>> & {
  error?: string;
};

/** Must stay ≤ backend `getBatchScanStatusController` max (50). */
const SCAN_STATUS_BATCH_SIZE = 50;

function chunkIds(ids: string[], size: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}

async function getFilesScanStatusChunk(fileIds: string[]): Promise<FileScanStatusResult[]> {
  const res = await fetch(buildBackendUrl('/api/files/scan-status'), {
    method: 'POST',
    headers: await csrfJsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ fileIds }),
  });

  if (!res.ok) {
    throw await errorFromFailedResponse(res, 'Failed to fetch batch scan status');
  }

  const data = await res.json();
  return Array.isArray(data.results) ? data.results : [];
}

/**
 * Batch fetch scan status for many fileIds.
 * Automatically chunks requests to ≤ SCAN_STATUS_BATCH_SIZE (backend max 50).
 */
export async function getFilesScanStatus(fileIds: string[]): Promise<FileScanStatusResult[]> {
  if (fileIds.length === 0) {
    return [];
  }

  const chunks = chunkIds(fileIds, SCAN_STATUS_BATCH_SIZE);
  const chunkResults = await Promise.all(chunks.map((chunk) => getFilesScanStatusChunk(chunk)));
  return chunkResults.flat();
}

const SCAN_POLL_INTERVAL_MS = 2500;
const SCAN_POLL_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Poll until virus scan completes (CLEAN / INFECTED / FAILED) or times out.
 * Supports AbortSignal so callers can cancel on unmount / navigation.
 */
export async function waitForFileScan(
  fileId: string,
  options?: {
    intervalMs?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
    onProgress?: (status: Awaited<ReturnType<typeof getFileScanStatus>>) => void;
  }
): Promise<Awaited<ReturnType<typeof getFileScanStatus>>> {
  const results = await waitForFilesScan([fileId], {
    intervalMs: options?.intervalMs,
    timeoutMs: options?.timeoutMs,
    signal: options?.signal,
    onProgress: (statuses) => {
      if (statuses[0]) {
        options?.onProgress?.(statuses[0]);
      }
    },
  });
  return results[0];
}

/**
 * Batch-poll until every file reaches COMPLETED/FAILED (or timeout).
 * Uses POST /files/scan-status — chunks of ≤50 ids per request when many files are pending.
 * Calls onFileComplete as soon as each file reaches a terminal state (progressive UI).
 */
export async function waitForFilesScan(
  fileIds: string[],
  options?: {
    intervalMs?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
    onProgress?: (statuses: FileScanStatusResult[]) => void;
    onFileComplete?: (status: FileScanStatusResult) => void;
  }
): Promise<FileScanStatusResult[]> {
  if (fileIds.length === 0) {
    return [];
  }

  const intervalMs = options?.intervalMs ?? SCAN_POLL_INTERVAL_MS;
  const timeoutMs = options?.timeoutMs ?? SCAN_POLL_TIMEOUT_MS;
  const startedAt = Date.now();
  let attempt = 0;
  const finalById = new Map<string, FileScanStatusResult>();
  let pending = [...fileIds];

  while (pending.length > 0 && Date.now() - startedAt < timeoutMs) {
    if (options?.signal?.aborted) {
      throw new Error('Scan status polling was cancelled.');
    }

    const batch = await getFilesScanStatus(pending);
    options?.onProgress?.(
      fileIds
        .map((id) => finalById.get(id) ?? batch.find((r) => r.fileId === id))
        .filter((r): r is FileScanStatusResult => Boolean(r))
    );

    for (const status of batch) {
      if (!status?.fileId) {
        continue;
      }
      if (status.error || status.scanStatus === 'COMPLETED' || status.scanStatus === 'FAILED') {
        if (!finalById.has(status.fileId)) {
          finalById.set(status.fileId, status);
          options?.onFileComplete?.(status);
        }
      }
    }

    // Keep any fileId that has not reached a terminal state yet.
    pending = pending.filter((id) => !finalById.has(id));
    if (pending.length === 0) {
      break;
    }

    attempt += 1;
    const delay = Math.min(intervalMs * Math.pow(1.25, attempt - 1), 15000);
    await new Promise<void>((resolve, reject) => {
      const signal = options?.signal;
      let timer: ReturnType<typeof setTimeout>;
      const onAbort = () => {
        clearTimeout(timer);
        reject(new Error('Scan status polling was cancelled.'));
      };
      timer = setTimeout(() => {
        // Remove the abort listener on normal completion so listeners don't
        // accumulate across polling iterations.
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, delay);
      signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  if (pending.length > 0) {
    throw new Error('Virus scanning is taking longer than expected. Please try again later.');
  }

  return fileIds.map((id) => {
    const status = finalById.get(id);
    if (!status) {
      throw new Error(`Missing scan status for fileId ${id}`);
    }
    return status;
  });
}

/**
 * Get presigned GET URL for viewing/downloading files
 * URLs are cached to reduce backend calls
 * @param filename - S3 key/filename
 * @returns Promise<string> - Presigned URL (valid for 30 minutes)
 */
export async function getPresignedGetUrl(filename: string): Promise<string> {
  const cached = urlCache.get(filename);
  const now = Date.now();

  // Return cached URL if still valid (with buffer before expiry)
  if (cached && cached.expiresAt > now + (S3_REFRESH_BEFORE_EXPIRY_SECONDS * 1000)) {
    return cached.url;
  }

  // Fetch new URL
  const res = await fetch(buildBackendUrl('/api/file/presigned-url'), {
    method: 'POST',
    headers: await csrfJsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ filename })
  });
  if (!res.ok) {
    throw await errorFromFailedResponse(res, 'Failed to get presigned GET URL');
  }
  const { url } = await res.json();
  
  const expiresAt = now + (S3_URL_EXPIRY_SECONDS * 1000);

  // Cache the URL
  urlCache.set(filename, { url, expiresAt });

  return url;
}

// List files for a given prefix
export async function listFilesByPrefix(prefix: string) {
  const res = await fetch(buildBackendUrl(`/api/files?prefix=${encodeURIComponent(prefix)}`), {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to list files');
  return await res.json();
}

// Delete a file from S3 by key
export async function deleteFileFromS3(key: string) {
  const res = await fetch(buildBackendUrl('/api/file/delete'), {
    method: 'POST',
    headers: await csrfJsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ key })
  });
  if (!res.ok) throw new Error('Failed to delete file');
  return await res.json();
}

// Delete a file completely (from both S3 and database)
export async function deleteFileCompletely(fileId: string, key: string) {
  const res = await fetch(buildBackendUrl('/api/file/delete'), {
    method: 'POST',
    headers: await csrfJsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ key, fileId })
  });
  if (!res.ok) {
    const errorResponse = await res.json();
    throw new Error(errorResponse.error || 'Failed to delete file completely');
  }
  return await res.json();
}

/**
 * Get presigned download URL (forces browser download)
 * URLs are cached to reduce backend calls
 * @param filename - S3 key/filename
 * @returns Promise<string> - Presigned URL (valid for 30 minutes)
 */
export async function getPresignedGetUrlForDownload(filename: string): Promise<string> {
  const cacheKey = `download_${filename}`; // Separate cache for download URLs
  const cached = urlCache.get(cacheKey);
  const now = Date.now();

  // Return cached URL if still valid (with 2 minute buffer before expiry)
  if (cached && cached.expiresAt > now + 120000) {
    return cached.url;
  }

  // Fetch new URL
  const res = await fetch(buildBackendUrl('/api/file/presigned-url/download'), {
    method: 'POST',
    headers: await csrfJsonHeaders(),
    credentials: 'include',
    body: JSON.stringify({ filename })
  });
  if (!res.ok) {
    throw await errorFromFailedResponse(res, 'Failed to get presigned download URL');
  }
  const { url } = await res.json();
  
  const expiresAt = now + (S3_URL_EXPIRY_SECONDS * 1000);

  // Cache the URL
  urlCache.set(cacheKey, { url, expiresAt });

  return url;
}