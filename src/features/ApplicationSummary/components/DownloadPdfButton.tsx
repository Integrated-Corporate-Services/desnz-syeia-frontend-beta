import React from 'react';

interface DownloadPdfButtonProps {
  onClick: () => void;
  isDownloading?: boolean;
  disabled?: boolean;
}

export const DownloadPdfButton: React.FC<DownloadPdfButtonProps> = ({
  onClick,
  isDownloading = false,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      className="govuk-button govuk-button--secondary"
      data-module="govuk-button"
      onClick={onClick}
      disabled={disabled || isDownloading}
      aria-busy={isDownloading}
    >
      {isDownloading ? 'Downloading...' : 'Download application (PDF)'}
    </button>
  );
};
