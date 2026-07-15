import { buildBackendUrl } from '../../../utils/apiConfig';
import { createLogger } from '../../../utils/logger';
import { getCsrfHeaders } from '../../../utils/csrf';

const logger = createLogger('pdfService');

export const downloadApplicationPdf = async (applicationId: string): Promise<void> => {
  try {
    logger.info('Initiating PDF download', { applicationId });

    const generateUrl = buildBackendUrl(`/backend/api/nwl/${applicationId}/download-pdf`);

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

    const presignedUrl = buildBackendUrl('/backend/api/file/presigned-url/download');

    const presignedResponse = await fetch(presignedUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeaders(),
      },
      body: JSON.stringify({ filename: s3Key }),
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
