// S3 API Service for presigned URL and upload
// Presigned URLs expire after 30 minutes (configured on backend)
// Auto-refresh mechanism keeps URLs valid while components are active
// Pauses when page is hidden to prevent session timeout redirects

// Configuration
const S3_URL_EXPIRY_SECONDS = 1800; // 30 minutes (should match backend and session timeout)
const REFRESH_BEFORE_EXPIRY = 120; // Refresh 2 minutes before expiry

interface UrlCacheEntry {
  url: string;
  expiresAt: number;
  refreshTimer?: NodeJS.Timeout;
}

// In-memory cache for presigned URLs with auto-refresh
const urlCache = new Map<string, UrlCacheEntry>();

// Track page visibility to pause auto-refresh when tab is hidden
let isPageVisible = !document.hidden;

// Listen for visibility changes
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible) {
      console.log('[S3 Cache] Page visible - auto-refresh will continue');
    } else {
      console.log('[S3 Cache] Page hidden - auto-refresh paused');
    }
  });
}

/**
 * Clear cached URL and stop auto-refresh
 * Call this when component unmounts to prevent memory leaks
 */
export function clearPresignedUrlCache(filename?: string) {
  if (filename) {
    const cached = urlCache.get(filename);
    if (cached?.refreshTimer) {
      clearTimeout(cached.refreshTimer);
      console.log(`[S3 Cache] Cleared cache and stopped auto-refresh for "${filename}"`);
    }
    urlCache.delete(filename);
  } else {
    // Clear all caches
    console.log(`[S3 Cache] Clearing all cached URLs (${urlCache.size} entries)`);
    urlCache.forEach((entry) => {
      if (entry.refreshTimer) {
        clearTimeout(entry.refreshTimer);
      }
    });
    urlCache.clear();
  }
}

export async function getPresignedUrls(files: { filename: string; contentType: string }[]) {
  const res = await fetch('/backend/api/upload/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files })
  });
  if (!res.ok) throw new Error('Failed to get presigned URLs');
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

/**
 * Get presigned GET URL for viewing/downloading files
 * URLs are cached and auto-refreshed before expiry
 * @param filename - S3 key/filename
 * @returns Promise<string> - Presigned URL (valid for 2 hours, auto-refreshes)
 */
export async function getPresignedGetUrl(filename: string): Promise<string> {
  const cached = urlCache.get(filename);
  const now = Date.now();

  // Return cached URL if still valid
  if (cached && cached.expiresAt > now) {
    const remainingSeconds = Math.floor((cached.expiresAt - now) / 1000);
    console.log(`[S3 Cache] Returning cached URL for "${filename}" (expires in ${remainingSeconds}s)`);
    return cached.url;
  }

  // Fetch new URL
  console.log(`[S3 Cache] Fetching new presigned URL for "${filename}"`);
  const res = await fetch('/backend/api/file/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename })
  });
  if (!res.ok) throw new Error('Failed to get presigned GET URL');
  const { url } = await res.json();
  
  const expiresAt = now + (S3_URL_EXPIRY_SECONDS * 1000);

  // Schedule auto-refresh before URL expires
  const refreshInterval = (S3_URL_EXPIRY_SECONDS - REFRESH_BEFORE_EXPIRY) * 1000;
  console.log('[S3 Cache] URL cached, will auto-refresh in', refreshInterval / 1000, 's', '(', Math.floor(refreshInterval / 60000), 'min) for:', filename);
  
  const refreshTimer = setTimeout(() => {
    // Skip refresh if page is hidden (user switched tabs)
    if (!isPageVisible) {
      console.log('[S3 Auto-Refresh] Skipping refresh - page is hidden for:', filename);
      return;
    }
    
    console.log('[S3 Auto-Refresh] Starting refresh for:', filename);
    fetch('/backend/api/file/presigned-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    })
      .then(async (res) => {
        if (!res.ok) {
          // Handle 401 gracefully - don't trigger redirect, just invalidate cache
          if (res.status === 401) {
            console.warn('[S3 Auto-Refresh] Session expired - cache cleared for:', filename);
            urlCache.delete(filename);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return; // 401 case, already handled
        const newExpiresAt = Date.now() + (S3_URL_EXPIRY_SECONDS * 1000);
        console.log('[S3 Auto-Refresh] Successfully refreshed URL for:', filename);
        urlCache.set(filename, {
          url: data.url,
          expiresAt: newExpiresAt,
        });
      })
      .catch((err) => {
        console.error('[S3 Auto-Refresh] Failed to refresh URL for:', filename, err);
        urlCache.delete(filename);
      });
  }, refreshInterval);

  // Cache the URL with refresh timer
  urlCache.set(filename, { url, expiresAt, refreshTimer });

  return url;
}

// List files for a given prefix
export async function listFilesByPrefix(prefix: string) {
  const res = await fetch(`/backend/api/files?prefix=${encodeURIComponent(prefix)}`);
  if (!res.ok) throw new Error('Failed to list files');
  return await res.json();
}

// Delete a file from S3 by key
export async function deleteFileFromS3(key: string) {
  const res = await fetch('/backend/api/file/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  });
  if (!res.ok) throw new Error('Failed to delete file');
  return await res.json();
}

// Delete a file completely (from both S3 and database)
export async function deleteFileCompletely(fileId: string, key: string) {
  const res = await fetch('/backend/api/file/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
 * URLs are cached and auto-refreshed before expiry
 * @param filename - S3 key/filename
 * @returns Promise<string> - Presigned URL (valid for 2 hours, auto-refreshes)
 */
export async function getPresignedGetUrlForDownload(filename: string): Promise<string> {
  const cacheKey = `download_${filename}`; // Separate cache for download URLs
  const cached = urlCache.get(cacheKey);
  const now = Date.now();

  // Return cached URL if still valid
  if (cached && cached.expiresAt > now) {
    const remainingSeconds = Math.floor((cached.expiresAt - now) / 1000);
    console.log(`[S3 Cache] Returning cached download URL for "${filename}" (expires in ${remainingSeconds}s)`);
    return cached.url;
  }

  // Fetch new URL
  console.log(`[S3 Cache] Fetching new presigned download URL for "${filename}"`);
  const res = await fetch('/backend/api/file/presigned-url/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename })
  });
  if (!res.ok) throw new Error('Failed to get presigned download URL');
  const { url } = await res.json();
  
  const expiresAt = now + (S3_URL_EXPIRY_SECONDS * 1000);

  // Schedule auto-refresh before URL expires
  const refreshInterval = (S3_URL_EXPIRY_SECONDS - REFRESH_BEFORE_EXPIRY) * 1000;
  console.log('[S3 Cache] Download URL cached, will auto-refresh in', refreshInterval / 1000, 's', '(', Math.floor(refreshInterval / 60000), 'min) for:', filename);
  
  const refreshTimer = setTimeout(() => {
    // Skip refresh if page is hidden (user switched tabs)
    if (!isPageVisible) {
      console.log('[S3 Auto-Refresh] Skipping refresh for download URL - page is hidden for:', filename);
      return;
    }
    
    console.log('[S3 Auto-Refresh] Starting refresh for download URL:', filename);
    fetch('/backend/api/file/presigned-url/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    })
      .then(async (res) => {
        if (!res.ok) {
          // Handle 401 gracefully - don't trigger redirect, just invalidate cache
          if (res.status === 401) {
            console.warn('[S3 Auto-Refresh] Session expired for download URL - cache cleared for:', filename);
            urlCache.delete(cacheKey);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return; // 401 case, already handled
        const newExpiresAt = Date.now() + (S3_URL_EXPIRY_SECONDS * 1000);
        console.log('[S3 Auto-Refresh] Successfully refreshed download URL for:', filename);
        urlCache.set(cacheKey, {
          url: data.url,
          expiresAt: newExpiresAt,
        });
      })
      .catch((err) => {
        console.error('[S3 Auto-Refresh] Failed to refresh download URL for:', filename, err);
        urlCache.delete(cacheKey);
      });
  }, refreshInterval);

  // Cache the URL with refresh timer
  urlCache.set(cacheKey, { url, expiresAt, refreshTimer });

  return url;
}