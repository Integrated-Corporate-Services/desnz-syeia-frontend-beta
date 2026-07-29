// S3 API Service for presigned URL and upload
// Presigned URLs expire after 30 minutes (configured on backend)
// URLs are cached in-memory to reduce backend calls

import { buildBackendUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';


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
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders()
    },
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
}> {
  const res = await fetch(buildBackendUrl('/api/upload/confirm'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders()
    },
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

/**
 * Get presigned GET URL for viewing/downloading files
 * URLs are cached to reduce backend calls
 * @param filename - S3 key/filename
 * @param fileId - uploaded_files id, used by the backend to look up the file's
 *   real current bucket (clean/quarantine once scanned) instead of assuming
 *   the original upload bucket, and to refuse files that aren't clean
 * @returns Promise<string> - Presigned URL (valid for 30 minutes)
 */
export async function getPresignedGetUrl(filename: string, fileId?: string): Promise<string> {

  // Fetch new URL
  const res = await fetch(buildBackendUrl('/api/file/presigned-url'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders()
    },
    credentials: 'include',
    body: JSON.stringify({ filename, fileId })
  });
  if (!res.ok) throw new Error('Failed to get presigned GET URL');
  const { url } = await res.json();

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
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders()
    },
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
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders()
    },
    credentials: 'include',
    body: JSON.stringify({ key, fileId })
  });
  if (!res.ok) {
    const errorResponse = await res.json();
    throw new Error(errorResponse.error || 'Failed to delete file completely');
  }
  return await res.json();
}

export interface FileScanStatusEntry {
  fileId: string;
  scanStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null;
  scanResult: 'CLEAN' | 'INFECTED' | null;
  virusName: string | null;
}

export async function getFileScanStatuses(fileIds: string[]): Promise<{ statuses: FileScanStatusEntry[] }> {
  if (fileIds.length === 0) {
    return { statuses: [] };
  }

  const res = await fetch(
    buildBackendUrl(`/api/upload/status?fileIds=${encodeURIComponent(fileIds.join(','))}`),
    { credentials: 'include' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch file scan statuses');
  }

  return await res.json();
}

/**
 * Get presigned download URL (forces browser download)
 * URLs are cached to reduce backend calls
 * @param filename - S3 key/filename
 * @returns Promise<string> - Presigned URL (valid for 30 minutes)
 */
export async function getPresignedGetUrlForDownload(filename: string, fileId?: string): Promise<string> {

  // Fetch new URL
  const res = await fetch(buildBackendUrl('/api/file/presigned-url/download'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders()
    },
    credentials: 'include',
    body: JSON.stringify({ filename, fileId })
  });
  if (!res.ok) throw new Error('Failed to get presigned download URL');
  const { url } = await res.json();

  return url;
}