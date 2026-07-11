// S3 API Service for presigned URL and upload
// Presigned URLs expire after 30 minutes (configured on backend)
// URLs are cached in-memory to reduce backend calls

import { buildBackendUrl } from '../utils/apiConfig';

// Configuration from environment variables
const S3_URL_EXPIRY_SECONDS = Number(import.meta.env.VITE_S3_URL_EXPIRY_SECONDS) || 1800; // Default: 30 minutes
const S3_REFRESH_BEFORE_EXPIRY_SECONDS = Number(import.meta.env.VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS) || 120; // Default: 2 minutes

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
  const res = await fetch(buildBackendUrl('/backend/api/upload/presigned-url'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ files })
  });
  
  if (!res.ok) {
    // Try to get detailed error message from response
    try {
      const errorData = await res.json();
      if (errorData.code === 'CREDENTIALS_EXPIRED') {
        throw new Error(errorData.userMessage || 'File upload service is temporarily unavailable. Please try again in a few minutes or contact support.');
      }
      throw new Error(errorData.error || errorData.userMessage || 'Failed to get presigned URLs');
    } catch (parseError) {
      throw new Error('Failed to get presigned URLs', { cause: parseError instanceof Error ? parseError : undefined });
    }
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

export async function confirmUpload(params: {
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
}): Promise<{
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
  scanEventId?: string;
  scanStatus?: string;
  scanResult?: string | null;
}> {
  const res = await fetch(buildBackendUrl('/backend/api/upload/confirm'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params)
  });
  
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || errorData.error || 'Failed to confirm file upload');
    } catch (parseError) {
      throw new Error('Failed to confirm file upload', { cause: parseError instanceof Error ? parseError : undefined });
    }
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
}> {
  const res = await fetch(buildBackendUrl(`/backend/api/files/${encodeURIComponent(fileId)}/scan-status`), {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch scan status');
    } catch (parseError) {
      throw new Error('Failed to fetch scan status', { cause: parseError instanceof Error ? parseError : undefined });
    }
  }

  return await res.json();
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
  const intervalMs = options?.intervalMs ?? SCAN_POLL_INTERVAL_MS;
  const timeoutMs = options?.timeoutMs ?? SCAN_POLL_TIMEOUT_MS;
  const startedAt = Date.now();
  let attempt = 0;

  while (Date.now() - startedAt < timeoutMs) {
    if (options?.signal?.aborted) {
      throw new Error('Scan status polling was cancelled.');
    }

    const status = await getFileScanStatus(fileId);
    options?.onProgress?.(status);

    if (status.scanStatus === 'COMPLETED' || status.scanStatus === 'FAILED') {
      return status;
    }

    attempt += 1;
    const delay = Math.min(intervalMs * Math.pow(1.25, attempt - 1), 15000);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, delay);
      options?.signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new Error('Scan status polling was cancelled.'));
        },
        { once: true }
      );
    });
  }

  throw new Error('Virus scanning is taking longer than expected. Please try again later.');
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
  const res = await fetch(buildBackendUrl('/backend/api/file/presigned-url'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ filename })
  });
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.userMessage || errorData.message || errorData.error || 'Failed to get presigned GET URL');
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message !== 'Failed to get presigned GET URL') {
        throw parseError;
      }
      throw new Error('Failed to get presigned GET URL');
    }
  }
  const { url } = await res.json();
  
  const expiresAt = now + (S3_URL_EXPIRY_SECONDS * 1000);

  // Cache the URL
  urlCache.set(filename, { url, expiresAt });

  return url;
}

// List files for a given prefix
export async function listFilesByPrefix(prefix: string) {
  const res = await fetch(buildBackendUrl(`/backend/api/files?prefix=${encodeURIComponent(prefix)}`), {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to list files');
  return await res.json();
}

// Delete a file from S3 by key
export async function deleteFileFromS3(key: string) {
  const res = await fetch(buildBackendUrl('/backend/api/file/delete'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ key })
  });
  if (!res.ok) throw new Error('Failed to delete file');
  return await res.json();
}

// Delete a file completely (from both S3 and database)
export async function deleteFileCompletely(fileId: string, key: string) {
  const res = await fetch(buildBackendUrl('/backend/api/file/delete'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(buildBackendUrl('/backend/api/file/presigned-url/download'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ filename })
  });
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.userMessage || errorData.message || errorData.error || 'Failed to get presigned download URL');
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message !== 'Failed to get presigned download URL') {
        throw parseError;
      }
      throw new Error('Failed to get presigned download URL');
    }
  }
  const { url } = await res.json();
  
  const expiresAt = now + (S3_URL_EXPIRY_SECONDS * 1000);

  // Cache the URL
  urlCache.set(cacheKey, { url, expiresAt });

  return url;
}