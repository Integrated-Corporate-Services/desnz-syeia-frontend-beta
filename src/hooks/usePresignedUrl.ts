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
 * @returns { url, isLoading, error, refresh }
 * 
 * @example
 * const { url, isLoading } = usePresignedUrl('uploads/file.pdf');
 * return <img src={url} />;
 */
export const usePresignedUrl = (filename: string | null, forceDownload = false) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUrl = useCallback(async () => {
    if (!filename) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedUrl = forceDownload
        ? await getPresignedGetUrlForDownload(filename)
        : await getPresignedGetUrl(filename);
      
      setUrl(fetchedUrl);
      logger.debug('Presigned URL fetched', { filename, forceDownload });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch presigned URL';
      setError(errorMsg);
      logger.error('Failed to fetch presigned URL', { filename, error: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }, [filename, forceDownload]);

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
