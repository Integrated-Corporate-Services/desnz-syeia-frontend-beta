import { createLogger } from './logger';
const logger = createLogger('s3DownloadUtil');

// Utility to get presigned S3 URL and open in new tab
export async function downloadS3File(keyOrUrl: string) {
  const { getPresignedGetUrl } = await import('../services/s3ApiService');
  try {
    const result = await getPresignedGetUrl(keyOrUrl);
    if (result.url) {
      window.open(result.url, '_blank');
    } else {
      logger.error('Failed to get download URL', { keyOrUrl });
      throw new Error('Failed to get download URL');
    }
  } catch (err) {
    logger.error('Download error on same tab', { keyOrUrl, error: err });
    throw new Error('Failed to download file');
  }
}

export async function downloadS3FileOnSameTab(keyOrUrl: string) {
  const { getPresignedGetUrlForDownload } = await import('../services/s3ApiService');
  try {
    const result = await getPresignedGetUrlForDownload(keyOrUrl);
    if (result.url) {
      // Simple approach: just navigate to the URL
      // The browser will either download or display based on Content-Type
      window.location.href = result.url;
    } else {
      logger.error('Failed to get download URL for same tab', { keyOrUrl });
      throw new Error('Failed to get download URL for same tab');
    }
  } catch (err) {
    logger.error('Download error on same tab', { keyOrUrl, error: err });
    throw err;
  }
}