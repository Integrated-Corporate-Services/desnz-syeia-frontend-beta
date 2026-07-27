import { createLogger } from './logger';
const logger = createLogger('s3DownloadUtil');

// Utility to get presigned S3 URL and open in new tab
export async function downloadS3File(keyOrUrl: string) {
  const { getPresignedGetUrl } = await import('../services/s3ApiService');
  try {
    const url = await getPresignedGetUrl(keyOrUrl);
    if (url) {
      // Open the presigned URL in a new tab
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';  // This opens in a new tab
      link.rel = 'noopener noreferrer';  // Security best practice
      
      // Trigger the link
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
    } else {
      logger.error('Failed to get download URL', { keyOrUrl });
      throw new Error('Failed to get download URL');
    }
  } catch (err) {
    logger.error('Download error', { keyOrUrl, error: err });
    throw new Error('Failed to download file');
  }
}

export async function downloadS3FileOnSameTab(keyOrUrl: string) {
  const { getPresignedGetUrlForDownload } = await import('../services/s3ApiService');
  try {
    const url = await getPresignedGetUrlForDownload(keyOrUrl);
    if (url) {
      // Simple approach: just navigate to the URL
      // The browser will either download or display based on Content-Type
      window.location.href = url;
    } else {
      logger.error('Failed to get download URL for same tab', { keyOrUrl });
      throw new Error('Failed to get download URL for same tab');
    }
  } catch (err) {
    logger.error('Download error on same tab', { keyOrUrl, error: err });
    // Only rethrow deliberate API/user-facing messages (plain `Error` from
    // s3ApiService). Wrap browser/network failures (TypeError, etc.) so the UI
    // always sees a stable download message.
    if (err instanceof Error && err.name === 'Error' && err.message) {
      throw err;
    }
    throw new Error('Failed to download file on same tab', {
      cause: err instanceof Error ? err : undefined,
    });
  }
}