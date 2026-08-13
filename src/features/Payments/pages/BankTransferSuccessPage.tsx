import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { NWL_BASE_URL } from '../../../constants/nwl';
import {
  BANK_TRANSFER_SUCCESS_PAGE,
  PAYMENT_BUTTON_LABELS,
  formatCurrency,
} from '../../../constants/payment';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { applicationApiService } from '../../../services/applicationApiService';
import type { BankTransferSuccessState } from '../../../types/payment';
import { createLogger } from '../../../utils/logger';
import { trackButtonClick } from '../../../utils/analytics';
import SkipLink from '../../../components/SkipLink';
import { usePdfDownload } from '../../ApplicationSummary/hooks';

const logger = createLogger('BankTransferSuccessPage');

const BankTransferSuccessPage: React.FC = () => {
  const location = useLocation();
  const applicationId = useGetApplicationId();


  const baseUrl = location.pathname.includes('/nwl/') ? NWL_BASE_URL : S37_BASE_URL;
  const isNwlRoute = baseUrl === NWL_BASE_URL;

  const {
    invoiceNumber,
    totalAmount,
    desnz_ref: passedDesnzRef,
    transactionNumber,
  } = (location.state as BankTransferSuccessState | null) || {};

  const [desnz_ref, setDesnzRef] = useState<string | undefined>(passedDesnzRef);
  const [loading, setLoading] = useState(!passedDesnzRef);
  const [error, setError] = useState<string | null>(null);

  const {
    isDownloading,
    isDownloadingPackage,
    error: pdfError,
    downloadPdf,
    downloadPackage,
    packageSizeLabel,
    clearError,
  } = usePdfDownload();

  useEffect(() => {
    if (!applicationId || passedDesnzRef) return;

    const fetchMissingData = async () => {
      try {
        setLoading(true);
        const data = await applicationApiService.fetchApplicationDetails(applicationId);
        setDesnzRef(data.desnz_ref || applicationId);
        setError(null);
      } catch (err) {
        logger.error('Error fetching bank transfer success data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch application details');
        setDesnzRef(applicationId);
      } finally {
        setLoading(false);
      }
    };

    fetchMissingData();
  }, [applicationId, passedDesnzRef]);

  const displayTransactionNumber =
    transactionNumber?.trim() || BANK_TRANSFER_SUCCESS_PAGE.NOT_PROVIDED_TEXT;

  const zipSupportText = packageSizeLabel
    ? `ZIP, about ${packageSizeLabel}. Includes your completed application form as a PDF and every document you uploaded.`
    : 'ZIP, about 4 MB. Includes your completed application form as a PDF and every document you uploaded.';

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">{BANK_TRANSFER_SUCCESS_PAGE.PANEL_TITLE}</h1>
              <div className="govuk-panel__body">
                {BANK_TRANSFER_SUCCESS_PAGE.APPLICATION_NUMBER_TEXT}
                <br />
                <strong>
                  {loading
                    ? BANK_TRANSFER_SUCCESS_PAGE.LOADING_TEXT
                    : desnz_ref || BANK_TRANSFER_SUCCESS_PAGE.NOT_AVAILABLE_TEXT}
                </strong>
              </div>
            </div>

            {error && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">{BANK_TRANSFER_SUCCESS_PAGE.ERROR_HEADING}</h2>
                <div className="govuk-error-summary__body">
                  <p>{error}</p>
                </div>
              </div>
            )}

            <h2 className="govuk-heading-m">{BANK_TRANSFER_SUCCESS_PAGE.PAYMENT_SUMMARY_HEADING}</h2>

            <table className="govuk-table">
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    {BANK_TRANSFER_SUCCESS_PAGE.SUMMARY_LABELS.TRANSACTION_NUMBER}
                  </th>
                  <td className="govuk-table__cell">{displayTransactionNumber}</td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    {BANK_TRANSFER_SUCCESS_PAGE.SUMMARY_LABELS.INVOICE_NUMBER}
                  </th>
                  <td className="govuk-table__cell">
                    {invoiceNumber || BANK_TRANSFER_SUCCESS_PAGE.NOT_AVAILABLE_TEXT}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    {BANK_TRANSFER_SUCCESS_PAGE.SUMMARY_LABELS.TOTAL_AMOUNT}
                  </th>
                  <td className="govuk-table__cell">
                    {totalAmount != null ? formatCurrency(totalAmount) : BANK_TRANSFER_SUCCESS_PAGE.NOT_AVAILABLE_TEXT}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    {BANK_TRANSFER_SUCCESS_PAGE.SUMMARY_LABELS.APPLICATION_STATUS}
                  </th>
                  <td className="govuk-table__cell">
                    {BANK_TRANSFER_SUCCESS_PAGE.APPLICATION_STATUS_PROCESSING}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="govuk-body">{BANK_TRANSFER_SUCCESS_PAGE.PROCESSING_STATUS_INFO}</p>

            {isNwlRoute && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-top-6">
                  Download your application
                </h2>

                <p className="govuk-body">
                  You need to share a copy of this application with the relevant landowner,
                  occupier or representative within 7 days of submitting it. Download it now to
                  save it or send it on.
                </p>

                {pdfError && (
                  <div
                    className="govuk-error-summary"
                    role="alert"
                    aria-labelledby="pdf-error-summary-title"
                  >
                    <h2 className="govuk-error-summary__title" id="pdf-error-summary-title">
                      There is a problem
                    </h2>
                    <div className="govuk-error-summary__body">
                      <p className="govuk-body">{pdfError}</p>
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

                <div className="govuk-button-group govuk-!-margin-bottom-4">
                  <button
                    type="button"
                    className="govuk-button"
                    data-module="govuk-button"
                    onClick={() => {
                      if (!isDownloading) {
                        downloadPackage(applicationId);
                      }
                    }}
                    disabled={isDownloading}
                    aria-label="Download your application and documents as a ZIP"
                  >
                    {isDownloadingPackage
                      ? 'Downloading ZIP...'
                      : 'Download your application and documents (ZIP)'}
                  </button>
                </div>

                <p className="govuk-body govuk-!-margin-top-0 govuk-!-margin-bottom-6">
                  {zipSupportText}
                </p>

                <p className="govuk-body">
                  <a
                    href="#"
                    className="govuk-link"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isDownloading) {
                        downloadPdf(applicationId);
                      }
                    }}
                    aria-disabled={isDownloading}
                    style={{
                      pointerEvents: isDownloading ? 'none' : 'auto',
                      opacity: isDownloading ? 0.5 : 1,
                    }}
                  >
                    {isDownloading ? 'Downloading...' : 'Download the application form only (PDF)'}
                  </a>
                </p>
              </>
            )}

            <h2 className="govuk-heading-m">{BANK_TRANSFER_SUCCESS_PAGE.WHAT_HAPPENS_NEXT_HEADING}</h2>
            <p className="govuk-body">{BANK_TRANSFER_SUCCESS_PAGE.EMAIL_CONFIRMATION}</p>
            <p className="govuk-body">
              {baseUrl === NWL_BASE_URL
                ? BANK_TRANSFER_SUCCESS_PAGE.FOLLOW_UP_INFO_NWL
                : BANK_TRANSFER_SUCCESS_PAGE.FOLLOW_UP_INFO_S37}
            </p>

            <div className="govuk-button-group govuk-!-margin-top-6">
              <Link
                to={`${baseUrl}/${applicationId}/application-summary`}
                className="govuk-button govuk-button--secondary"
                onClick={() => {
                  trackButtonClick('View application summary', location.pathname, {
                    application_id: applicationId,
                    desnz_ref: desnz_ref,
                  });
                }}
              >
                {PAYMENT_BUTTON_LABELS.VIEW_APPLICATION_SUMMARY}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default BankTransferSuccessPage;
