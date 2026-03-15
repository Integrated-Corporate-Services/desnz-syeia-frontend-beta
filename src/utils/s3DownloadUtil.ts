import { createLogger } from './logger';
const logger = createLogger('s3DownloadUtil');

// Utility to get presigned S3 URL and open in new tab
export async function downloadS3File(keyOrUrl: string) {
  const { getPresignedGetUrl } = await import('../services/s3ApiService');
  try {
    const result = await getPresignedGetUrl(keyOrUrl);
    if (result.url) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = result.url;
      
      // Extract filename from URL if not provided
      if (filename) {
        link.download = filename;
      }
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
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