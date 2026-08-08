import { buildBackendUrl } from '../../../utils/apiConfig';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('applicationPackageService');

/**
 * Downloads the complete NWL application package as a ZIP file
 * 
 * The package includes:
 * - Application Summary PDF (generated on-demand or from cache)
 * - All uploaded documents organized by category in numbered folders:
 *   1. Application_Summary (PDF)
 *   2. Wayleave_Offer
 *   3. Implied_Wayleave
 *   4. Site_Identification
 *   5. Land_Ownership
 *   6. Land_Registry
 *   7. Site_Plans
 *   8. Asset_Plans
 *   9. Consultation_Evidence
 *   10. Objector_Evidence
 *   11. Representative_Evidence
 *   12. Other_Documents
 * 
 * Technical details:
 * - Backend streams the ZIP file (no server-side storage)
 * - Rate limited: 3 requests per 60 seconds per user
 * - Maximum limits: 100 documents, 2GB total size
 * - 120-second request timeout on backend
 * - Uses Content-Disposition header for filename
 * 
 * @param applicationId - The UUID of the application
 * @throws Error if download fails or user lacks permissions
 * 
 * @example
 * await downloadApplicationPackage('123e4567-e89b-12d3-a456-426614174000');
 */
export const downloadApplicationPackage = async (applicationId: string): Promise<void> => {
  try {
    logger.info('Initiating application package download', { applicationId });

    const downloadUrl = buildBackendUrl(`/api/nwl/${applicationId}/download-application-package`);

    const response = await fetch(downloadUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/zip, application/octet-stream',
      },
    });

    if (!response.ok) {
      logger.error('Package download failed', {
        applicationId,
        status: response.status,
        statusText: response.statusText,
      });

      // Try to extract error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If response is not JSON, use status text
      }

      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    // Extract filename from Content-Disposition header
    // Example: attachment; filename="NWL_Application_ABC123.zip"
    let filename = `NWL_Application_${applicationId}.zip`;
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    logger.info('Received package response, converting to blob', { filename });

    // Convert response to blob
    const blob = await response.blob();

    logger.info('Creating download link', { 
      filename, 
      blobSize: blob.size,
      blobType: blob.type,
    });

    // Create temporary download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    logger.info('Package download initiated successfully', { 
      applicationId, 
      filename,
      sizeBytes: blob.size,
    });
  } catch (error: any) {
    logger.error('Failed to download application package', { 
      error: error?.message || 'Unknown error',
      applicationId,
      status: error?.status,
    });
    throw error;
  }
};
