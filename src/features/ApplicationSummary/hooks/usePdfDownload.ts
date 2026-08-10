import { useState } from 'react';
import { downloadApplicationPackage, downloadApplicationPdf } from '../services/pdfService';

interface UsePdfDownloadResult {
  isDownloading: boolean;
  isDownloadingPdf: boolean;
  isDownloadingPackage: boolean;
  error: string | null;
  downloadPdf: (applicationId: string) => Promise<void>;
  downloadPackage: (applicationId: string) => Promise<void>;
  packageSizeLabel: string | null;
  clearError: () => void;
}

const formatSize = (bytes: number): string => {
  if (bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const usePdfDownload = (): UsePdfDownloadResult => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingPackage, setIsDownloadingPackage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packageSizeLabel, setPackageSizeLabel] = useState<string | null>(null);

  const downloadPdf = async (applicationId: string) => {
    try {
      setIsDownloadingPdf(true);
      setError(null);
      await downloadApplicationPdf(applicationId);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to download PDF. Please try again.';
      setError(errorMessage);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const downloadPackage = async (applicationId: string) => {
    try {
      setIsDownloadingPackage(true);
      setError(null);
      const result = await downloadApplicationPackage(applicationId);
      setPackageSizeLabel(formatSize(result.sizeBytes));
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to download application package. Please try again.';
      setError(errorMessage);
    } finally {
      setIsDownloadingPackage(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isDownloading: isDownloadingPdf || isDownloadingPackage,
    isDownloadingPdf,
    isDownloadingPackage,
    error,
    downloadPdf,
    downloadPackage,
    packageSizeLabel,
    clearError,
  };
};
