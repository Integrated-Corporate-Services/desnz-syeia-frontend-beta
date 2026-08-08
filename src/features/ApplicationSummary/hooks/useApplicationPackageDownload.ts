import { useState } from 'react';
import { downloadApplicationPackage } from '../services/applicationPackageService';

interface UseApplicationPackageDownloadResult {
  isDownloading: boolean;
  error: string | null;
  downloadPackage: (applicationId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for downloading NWL application packages (PDF + all documents as ZIP)
 * 
 * Features:
 * - Downloads application summary PDF + all uploaded documents as single ZIP file
 * - Rate limited on backend (3 requests per 60 seconds)
 * - Streaming download (no server-side storage)
 * 
 * @returns Object containing download state and functions
 * 
 */
export const useApplicationPackageDownload = (): UseApplicationPackageDownloadResult => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPackage = async (applicationId: string) => {
    try {
      setIsDownloading(true);
      setError(null);
      await downloadApplicationPackage(applicationId);
    } catch (err: any) {
      let errorMessage = 'Failed to download application package. Please try again.';
      
      if (err?.message) {
        errorMessage = err.message;
      }
      
      // Handle specific error cases
      if (err?.status === 429) {
        errorMessage = 'Too many download requests. Please wait a moment and try again.';
      } else if (err?.status === 413) {
        errorMessage = 'This application has too many documents to download. Please contact support.';
      } else if (err?.status === 503 || err?.status === 504) {
        errorMessage = 'The download service is temporarily unavailable. Please try again in a few minutes.';
      } else if (err?.status === 403) {
        errorMessage = 'You do not have permission to download this application package.';
      }
      
      setError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isDownloading,
    error,
    downloadPackage,
    clearError,
  };
};
