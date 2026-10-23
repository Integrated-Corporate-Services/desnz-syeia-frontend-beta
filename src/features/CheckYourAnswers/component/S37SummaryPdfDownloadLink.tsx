import React from 'react';
import { usePdfDownload } from '../../ApplicationSummary/hooks';
import { BUTTON_LABELS } from '../constants/applicationSummaryLabels';

// Same post-submission statuses the NWL summary uses to offer its downloads.
const POST_SUBMISSION_STATUSES = [
  'SUBMITTED',
  'PROCESSING_PAYMENT',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'IN_ABEYANCE',
  'FURTHER_INFORMATION_REQUESTED',
  'REPRESENTATION_STAGE',
  'DECISION_ISSUED',
  'APPROVED',
  'REJECTED',
  'WITHDRAWN',
];

interface S37SummaryPdfDownloadLinkProps {
  applicationId: string;
  status?: string | null;
}

/**
 * SYEIA-2695: "Download the application summary only (PDF)" link for a submitted S37 application.
 * Mirrors the NWL summary link: disabled while a download is in progress, with an error summary on failure.
 */
export const S37SummaryPdfDownloadLink: React.FC<S37SummaryPdfDownloadLinkProps> = ({
  applicationId,
  status,
}) => {
  const { isDownloading, error, downloadPdf, clearError } = usePdfDownload();

  const normalizedStatus = (status ?? '').toUpperCase().replace(/\s+/g, '_');
  if (!POST_SUBMISSION_STATUSES.includes(normalizedStatus)) {
    return null;
  }

  return (
    <>
      {error && (
        <div
          className="govuk-error-summary"
          role="alert"
          aria-labelledby="s37-pdf-error-summary-title"
        >
          <h2 className="govuk-error-summary__title" id="s37-pdf-error-summary-title">
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
          <button
            type="button"
            className="govuk-button govuk-button--secondary govuk-!-margin-top-2"
            onClick={clearError}
          >
            Dismiss
          </button>
        </div>
      )}

      <p className="govuk-body">
        <a
          href="#"
          className="govuk-link"
          onClick={(e) => {
            e.preventDefault();
            if (!isDownloading) {
              downloadPdf(applicationId, 'S37');
            }
          }}
          aria-disabled={isDownloading}
          style={{
            pointerEvents: isDownloading ? 'none' : 'auto',
            opacity: isDownloading ? 0.5 : 1,
          }}
        >
          {isDownloading ? BUTTON_LABELS.DOWNLOADING : BUTTON_LABELS.DOWNLOAD_SUMMARY_PDF}
        </a>
      </p>
    </>
  );
};

export default S37SummaryPdfDownloadLink;
