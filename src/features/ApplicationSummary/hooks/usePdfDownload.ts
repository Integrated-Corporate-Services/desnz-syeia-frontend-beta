import { useState } from 'react';
import { downloadApplicationPdf } from '../services/pdfService';

interface UsePdfDownloadResult {
  isDownloading: boolean;
  error: string | null;
  downloadPdf: (applicationId: string) => Promise<void>;
  clearError: () => void;
}

export const usePdfDownload = (): UsePdfDownloadResult => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = async (applicationId: string) => {
    try {
      setIsDownloading(true);
      setError(null);
      await downloadApplicationPdf(applicationId);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to download PDF. Please try again.';
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
    downloadPdf,
    clearError,
  };
};
