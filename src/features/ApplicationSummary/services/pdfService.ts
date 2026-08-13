import { buildBackendUrl } from '../../../utils/apiConfig';
import { createLogger } from '../../../utils/logger';
import { getCsrfHeaders } from '../../../utils/csrf';

const logger = createLogger('pdfService');

export interface DownloadPackageResult {
  filename: string;
  sizeBytes: number;
}

const parseFilenameFromContentDisposition = (header: string | null): string | null => {
  if (!header) return null;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const asciiMatch = header.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1] || null;
};

const triggerBrowserDownload = (blob: Blob, filename: string): void => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
};

export const downloadApplicationPdf = async (applicationId: string): Promise<void> => {
  try {
    logger.info('Initiating PDF download', { applicationId });

    const generateUrl = buildBackendUrl(`/api/nwl/${applicationId}/download-pdf`);

    const generateResponse = await fetch(generateUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!generateResponse.ok) {
      const errorData = await generateResponse.json().catch(() => ({ error: 'Failed to generate PDF' }));
      throw new Error(errorData.error || `HTTP ${generateResponse.status}: ${generateResponse.statusText}`);
    }

    const { s3Key, filename } = await generateResponse.json();
    logger.info('PDF S3 key received', { s3Key, filename });

    const presignedUrl = buildBackendUrl('/api/file/presigned-url/download');

    const presignedResponse = await fetch(presignedUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeaders(),
      },
      body: JSON.stringify({
        filename: s3Key,
        applicationId,
      }),
    });

    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json().catch(() => ({ error: 'Failed to get download URL' }));
      throw new Error(errorData.error || `HTTP ${presignedResponse.status}: ${presignedResponse.statusText}`);
    }

    const { url } = await presignedResponse.json();
    logger.info('Presigned URL received', { url: url.substring(0, 100) + '...' });

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logger.info('PDF download initiated successfully', { applicationId, filename });
  } catch (error) {
    logger.error('Failed to download PDF', { error, applicationId });
    throw error;
  }
};

export const downloadApplicationPackage = async (applicationId: string): Promise<DownloadPackageResult> => {
  try {
    logger.info('Initiating ZIP package download', { applicationId });

    const packageUrl = buildBackendUrl(`/api/nwl/${applicationId}/download-application-package`);

    const response = await fetch(packageUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/zip, application/json',
        ...getCsrfHeaders(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to download ZIP package' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const disposition = response.headers.get('content-disposition');
    const fallbackName = `NWL_${applicationId}_Complete_Application.zip`;
    const filename = parseFilenameFromContentDisposition(disposition) || fallbackName;
    const blob = await response.blob();

    triggerBrowserDownload(blob, filename);

    logger.info('ZIP package download initiated successfully', {
      applicationId,
      filename,
      sizeBytes: blob.size,
    });

    return {
      filename,
      sizeBytes: blob.size,
    };
  } catch (error) {
    logger.error('Failed to download ZIP package', { error, applicationId });
    throw error;
  }
};
