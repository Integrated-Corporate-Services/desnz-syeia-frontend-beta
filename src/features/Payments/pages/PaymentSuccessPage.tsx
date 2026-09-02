import React, {useState, useEffect} from 'react';
import { useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { applicationApiService } from '../../../services/applicationApiService';
import { trackPaymentEvent, trackButtonClick } from '../../../utils/analytics';
import { BANK_TRANSFER_SUCCESS_PAGE, formatCurrency } from '../../../constants/payment';
import { usePdfDownload } from '../../ApplicationSummary/hooks';
import PageTitle from '../../../components/PageTitle';
import { fetchFeeTotal, fetchInvoiceNumber } from '../services/paymentDetailsService';

const CARD_PAYMENT_SUCCESS_CONTENT = {
  PANEL_TITLE: 'Application submitted',
  APPLICATION_NUMBER_TEXT: 'Your application number is',
  LOADING_TEXT: 'Loading...',
  NOT_AVAILABLE_TEXT: 'N/A',
  PAYMENT_SUMMARY_HEADING: 'Payment Summary',
  SUMMARY_LABELS: {
    REFERENCE_NUMBER: 'Reference number',
    INVOICE_NUMBER: 'Invoice number',
    TOTAL_AMOUNT: 'Total amount',
    PAYMENT_STATUS: 'Payment status',
  },
  PAYMENT_STATUS_PAID: 'Paid',
  DOWNLOAD_HEADING: 'Download and share a copy of your application',
  DOWNLOAD_INFO:
    'You need to share a copy of this application with the objector or their representative within 7 days of submitting it.',
  WHAT_HAPPENS_NEXT_HEADING: 'What happens next',
  EMAIL_CONFIRMATION: 'You will receive an email to confirm your application has been submitted.',
  INVOICE_INFO: 'You can find your invoice in the application summary.',
  VIEW_APPLICATION_SUMMARY: 'View application summary',
} as const;

interface PaymentSuccessState {
  invoiceNumber?: string;
  paymentId?: string;
  reference?: string;
  desnz_ref?: string;
  totalAmount?: number;
}

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const applicationId = useGetApplicationId();

  const baseUrl = location.pathname.includes('/nwl/') ? NWL_BASE_URL : S37_BASE_URL;
  const isNwlRoute = baseUrl === NWL_BASE_URL;

  const {
    invoiceNumber: passedInvoiceNumber,
    paymentId,
    reference: passedReference,
    desnz_ref: passedDesnzRef,
    totalAmount: passedTotalAmount,
  } = (location.state as PaymentSuccessState | null) || {};

  const [desnz_ref, setDesnzRef] = useState<string | undefined>(passedDesnzRef);
  const [invoiceNumber, setInvoiceNumber] = useState<string | undefined>(passedInvoiceNumber);
  const [reference, setReference] = useState<string | undefined>(passedReference || paymentId);
  const [totalAmount, setTotalAmount] = useState<number | undefined>(passedTotalAmount);
  const [loading, setLoading] = useState(!passedDesnzRef || !passedInvoiceNumber || passedTotalAmount == null);
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
    trackPaymentEvent('payment_success_page_loaded', {
      page_path: location.pathname,
      application_id: applicationId,
      invoice_number: passedInvoiceNumber,
      payment_id: paymentId,
      desnz_ref: passedDesnzRef,
      total_amount: passedTotalAmount,
    });
  }, []);

  useEffect(() => {
    if (!applicationId) {
      return;
    }

    const needsDesnzRef = !passedDesnzRef;
    const needsInvoiceNumber = !passedInvoiceNumber;
    const needsAmount = passedTotalAmount == null;
    const needsReference = !passedReference && !paymentId;

    if (!needsDesnzRef && !needsInvoiceNumber && !needsAmount && !needsReference) {
      return;
    }

    const fetchMissingData = async () => {
      try {
        setLoading(true);
        const [appDetails, invoiceFromApi, feeTotal, review] = await Promise.all([
          needsDesnzRef ? applicationApiService.fetchApplicationDetails(applicationId) : Promise.resolve(null),
          needsInvoiceNumber ? fetchInvoiceNumber(applicationId) : Promise.resolve(null),
          needsAmount ? fetchFeeTotal(applicationId) : Promise.resolve(null),
          needsReference ? applicationApiService.getApplicationReview(applicationId).catch(() => null) : Promise.resolve(null),
        ]);

        if (appDetails) {
          setDesnzRef(appDetails.desnz_ref || applicationId);
        }
        if (invoiceFromApi) {
          setInvoiceNumber(invoiceFromApi);
        }
        if (typeof feeTotal === 'number') {
          setTotalAmount(feeTotal);
        }
        if (review) {
          const payment = (review as {
            payment?: { payment_id?: string; reference?: string; transaction_number?: string };
            sections?: { payment?: { payment_id?: string; reference?: string; transaction_number?: string } };
          }).payment || (review as { sections?: { payment?: { payment_id?: string; reference?: string; transaction_number?: string } } }).sections?.payment;
          const paymentRef = payment?.payment_id || payment?.reference || payment?.transaction_number;
          if (paymentRef) {
            setReference(paymentRef);
          }
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch payment details');
        if (!passedDesnzRef) {
          setDesnzRef(applicationId);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMissingData();
  }, [applicationId, passedDesnzRef, passedInvoiceNumber, passedReference, passedTotalAmount, paymentId]);

  return (
    <>
            <PageTitle title="Application submitted" />
            <div className="govuk-width-container">
              <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">{CARD_PAYMENT_SUCCESS_CONTENT.PANEL_TITLE}</h1>
              <div className="govuk-panel__body">
                {CARD_PAYMENT_SUCCESS_CONTENT.APPLICATION_NUMBER_TEXT}<br />
                <strong>
                  {loading
                    ? CARD_PAYMENT_SUCCESS_CONTENT.LOADING_TEXT
                    : desnz_ref || CARD_PAYMENT_SUCCESS_CONTENT.NOT_AVAILABLE_TEXT}
                </strong>
              </div>
            </div>

            {error && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">Warning</h2>
                <div className="govuk-error-summary__body">
                  <p>{error}</p>
                </div>
              </div>
            )}

            <h2 className="govuk-heading-m">{CARD_PAYMENT_SUCCESS_CONTENT.PAYMENT_SUMMARY_HEADING}</h2>

            <table className="govuk-table">
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">{CARD_PAYMENT_SUCCESS_CONTENT.SUMMARY_LABELS.REFERENCE_NUMBER}</th>
                  <td className="govuk-table__cell">
                    {loading && !reference
                      ? CARD_PAYMENT_SUCCESS_CONTENT.LOADING_TEXT
                      : reference || CARD_PAYMENT_SUCCESS_CONTENT.NOT_AVAILABLE_TEXT}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">{CARD_PAYMENT_SUCCESS_CONTENT.SUMMARY_LABELS.INVOICE_NUMBER}</th>
                  <td className="govuk-table__cell">
                    {loading && !invoiceNumber
                      ? CARD_PAYMENT_SUCCESS_CONTENT.LOADING_TEXT
                      : invoiceNumber || CARD_PAYMENT_SUCCESS_CONTENT.NOT_AVAILABLE_TEXT}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">{CARD_PAYMENT_SUCCESS_CONTENT.SUMMARY_LABELS.TOTAL_AMOUNT}</th>
                  <td className="govuk-table__cell">
                    {typeof totalAmount === 'number'
                      ? formatCurrency(totalAmount)
                      : loading
                        ? CARD_PAYMENT_SUCCESS_CONTENT.LOADING_TEXT
                        : CARD_PAYMENT_SUCCESS_CONTENT.NOT_AVAILABLE_TEXT}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">{CARD_PAYMENT_SUCCESS_CONTENT.SUMMARY_LABELS.PAYMENT_STATUS}</th>
                  <td className="govuk-table__cell">{CARD_PAYMENT_SUCCESS_CONTENT.PAYMENT_STATUS_PAID}</td>
                </tr>
              </tbody>
            </table>

            {isNwlRoute && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-top-6">
                  {CARD_PAYMENT_SUCCESS_CONTENT.DOWNLOAD_HEADING}
                </h2>

                <p className="govuk-body">
                  {CARD_PAYMENT_SUCCESS_CONTENT.DOWNLOAD_INFO}
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
                    aria-label="Download your application and attached documents as a ZIP"
                  >
                    {isDownloadingPackage
                      ? 'Downloading ZIP...'
                      : packageSizeLabel
                        ? `Download your application and attached documents (ZIP, ${packageSizeLabel})`
                        : 'Download your application and attached documents (ZIP)'}
                  </button>
                </div>

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
                    {isDownloading ? 'Downloading...' : 'Download the application summary only (PDF)'}
                  </a>
                </p>
              </>
            )}

            <h2 className="govuk-heading-m">{CARD_PAYMENT_SUCCESS_CONTENT.WHAT_HAPPENS_NEXT_HEADING}</h2>
            <p className="govuk-body">
              {CARD_PAYMENT_SUCCESS_CONTENT.EMAIL_CONFIRMATION}
            </p>
            <p className="govuk-body">{CARD_PAYMENT_SUCCESS_CONTENT.INVOICE_INFO}</p>
            <p className="govuk-body">
              {baseUrl === NWL_BASE_URL
                ? BANK_TRANSFER_SUCCESS_PAGE.FOLLOW_UP_INFO_NWL
                : BANK_TRANSFER_SUCCESS_PAGE.FOLLOW_UP_INFO_S37}
            </p>

            <div className="govuk-button-group">
              <Link
                to={`${baseUrl}/${applicationId}/application-summary`}
                className="govuk-button govuk-button--secondary"
                onClick={() => {
                  trackButtonClick('View application summary', location.pathname, {
                    application_id: applicationId,
                    desnz_ref: desnz_ref,
                    payment_id: paymentId,
                  });
                }}
              >
                {CARD_PAYMENT_SUCCESS_CONTENT.VIEW_APPLICATION_SUMMARY}
              </Link>
            </div>
          </div>
        </div>
          </div>
    </>
  );
};

export default PaymentSuccessPage;
