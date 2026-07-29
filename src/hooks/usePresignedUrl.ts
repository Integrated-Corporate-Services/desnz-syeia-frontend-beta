import { useEffect, useState, useCallback } from 'react';
import { 
  getPresignedGetUrl, 
  getPresignedGetUrlForDownload,
  clearPresignedUrlCache 
} from '../services/s3ApiService';
import { createLogger } from '../utils/logger';

const logger = createLogger('usePresignedUrl');

/**
 * React hook for presigned S3 URLs with caching
 * URLs are cached for ~28 minutes (2 min buffer before 30 min backend expiry)
 *
 * @param filename - S3 key/filename
 * @param forceDownload - Whether to force download (optional)
 * @param fileId - uploaded_files id (optional). When provided, the backend looks
 *   up the file's real current bucket (clean/quarantine once scanned) instead of
 *   assuming the original upload bucket, and refuses files that aren't clean.
 *   Without it, links can 404 once the scan workflow moves/deletes the original.
 * @returns { url, isLoading, error, refresh }
 *
 * @example
 * const { url, isLoading } = usePresignedUrl('uploads/file.pdf', false, doc.fileId);
 * return <img src={url} />;
 */
export const usePresignedUrl = (filename: string | null, forceDownload = false, fileId?: string) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUrl = useCallback(async () => {
    if (!filename) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedUrl = forceDownload
        ? await getPresignedGetUrlForDownload(filename, fileId)
        : await getPresignedGetUrl(filename, fileId);

      setUrl(fetchedUrl);
      logger.debug('Presigned URL fetched', { filename, forceDownload, fileId });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch presigned URL';
      setError(errorMsg);
      logger.error('Failed to fetch presigned URL', { filename, error: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }, [filename, forceDownload, fileId]);

  useEffect(() => {
    if (filename) {
      fetchUrl();
    }

    // Cleanup: clear cache when component unmounts
    return () => {
      if (filename) {
        clearPresignedUrlCache(filename);
        if (forceDownload) {
          clearPresignedUrlCache(`download_${filename}`);
        }
      }
    };
  }, [filename, forceDownload, fetchUrl]);

  return {
    url,
    isLoading,
    error,
    refresh: fetchUrl,
  };
};
