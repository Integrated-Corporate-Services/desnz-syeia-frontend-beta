import React from 'react';

export interface FileScanBannerProps {
  isScanning?: boolean;
  scanStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'INFECTED' | 'FAILED' | null;
  fileCount?: number;
  fileName?: string;
  isQueued?: boolean;
}

export const FileScanBanner: React.FC<FileScanBannerProps> = ({
  isScanning = false,
  scanStatus,
  fileCount = 1,
  fileName,
  isQueued = false,
}) => {
  if (!isScanning && !isQueued && scanStatus !== 'PROCESSING' && scanStatus !== 'INFECTED') {
    return null;
  }

  if (scanStatus === 'INFECTED') {
    return (
      <div
        className="govuk-notification-banner govuk-notification-banner--error govuk-!-margin-bottom-4"
        role="alert"
        aria-labelledby="file-scan-infected-title"
        data-module="govuk-notification-banner"
      >
        <div className="govuk-notification-banner__header">
          <h2 className="govuk-notification-banner__title" id="file-scan-infected-title">
            Virus detected
          </h2>
        </div>
        <div className="govuk-notification-banner__content">
          <p className="govuk-notification-banner__heading">
            {fileName ? `Virus detected in file "${fileName}".` : 'Virus detected in uploaded file.'}
          </p>
          <p className="govuk-body">
            This file has been quarantined and cannot be accepted. Please remove the file and upload a clean copy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="govuk-notification-banner govuk-!-margin-bottom-4"
      role="status"
      aria-live="polite"
      aria-labelledby="file-scan-banner-title"
      data-module="govuk-notification-banner"
    >
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id="file-scan-banner-title">
          Important
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <p className="govuk-notification-banner__heading">
          {isQueued
            ? 'Files validated and ready for virus scan'
            : 'Virus scan in progress'}
        </p>
        <p className="govuk-body">
          {isQueued
            ? `${fileCount} file${fileCount > 1 ? 's' : ''} passed validation and will be scanned for viruses when you save.`
            : `Your uploaded ${fileCount > 1 ? `${fileCount} files are` : 'file is'} being checked for viruses. This usually takes a few seconds.`}
        </p>
      </div>
    </div>
  );
};

export default FileScanBanner;
