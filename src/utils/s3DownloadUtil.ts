import { createLogger } from './logger';
import { buildBackendUrl } from './apiConfig';
const logger = createLogger('s3DownloadUtil');

// Utility to get presigned S3 URL and open in new tab
export async function downloadS3File(keyOrUrl: string, applicationId?: string) {
  const { getPresignedGetUrl } = await import('../services/s3ApiService');
  try {
    const url = await getPresignedGetUrl(keyOrUrl, applicationId);
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

export async function downloadS3FileOnSameTab(keyOrUrl: string, fileId?: string, applicationId?: string, documentId?: string) {
  if (documentId) {
    downloadDocument(documentId);
    return;
  }

  const { getPresignedGetUrlForDownload } = await import('../services/s3ApiService');
  try {
    const url = await getPresignedGetUrlForDownload(keyOrUrl, fileId, applicationId);
    if (url) {
      window.location.href = url;
    } else {
      logger.error('Failed to get download URL for same tab', { keyOrUrl });
      throw new Error('Failed to get download URL for same tab');
    }
  } catch (err) {
    logger.error('Download error on same tab', { keyOrUrl, error: err });
    throw new Error('Failed to download file on same tab');
  }
}

export function downloadDocument(documentId: string): void {
  try {
    const url = buildBackendUrl(`/api/documents/${encodeURIComponent(documentId)}/download`);
    logger.info('Downloading document via documentId', { documentId });
    window.location.href = url;
  } catch (err) {
    logger.error('Download error', { documentId, error: err });
    throw new Error('Failed to download document');
  }
}