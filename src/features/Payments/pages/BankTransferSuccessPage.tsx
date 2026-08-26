import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
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
import { fetchFeeTotal, fetchInvoiceNumber } from '../services/paymentDetailsService';

const logger = createLogger('BankTransferSuccessPage');

const BankTransferSuccessPage: React.FC = () => {
  const location = useLocation();
  const applicationId = useGetApplicationId();


  const baseUrl = location.pathname.includes('/nwl/') ? NWL_BASE_URL : S37_BASE_URL;

  const {
    invoiceNumber: passedInvoiceNumber,
    totalAmount: passedTotalAmount,
    desnz_ref: passedDesnzRef,
    transactionNumber,
  } = (location.state as BankTransferSuccessState | null) || {};

  const [desnz_ref, setDesnzRef] = useState<string | undefined>(passedDesnzRef);
  const [invoiceNumber, setInvoiceNumber] = useState<string | undefined>(passedInvoiceNumber);
  const [totalAmount, setTotalAmount] = useState<number | undefined>(
    typeof passedTotalAmount === 'number' ? passedTotalAmount : undefined
  );
  const [loading, setLoading] = useState(!passedDesnzRef || !passedInvoiceNumber || passedTotalAmount == null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const needsDesnzRef = !passedDesnzRef;
    const needsInvoiceNumber = !passedInvoiceNumber;
    const needsAmount = passedTotalAmount == null;

    if (!needsDesnzRef && !needsInvoiceNumber && !needsAmount) return;

    const fetchMissingData = async () => {
      try {
        setLoading(true);
        const [data, invoiceFromApi, feeTotal] = await Promise.all([
          needsDesnzRef ? applicationApiService.fetchApplicationDetails(applicationId) : Promise.resolve(null),
          needsInvoiceNumber ? fetchInvoiceNumber(applicationId) : Promise.resolve(null),
          needsAmount ? fetchFeeTotal(applicationId) : Promise.resolve(null),
        ]);
        if (data) {
          setDesnzRef(data.desnz_ref || applicationId);
        }
        if (invoiceFromApi) {
          setInvoiceNumber(invoiceFromApi);
        }
        if (typeof feeTotal === 'number') {
          setTotalAmount(feeTotal);
        }
        setError(null);
      } catch (err) {
        logger.error('Error fetching bank transfer success data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch application details');
        if (!passedDesnzRef) {
          setDesnzRef(applicationId);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMissingData();
  }, [applicationId, passedDesnzRef, passedInvoiceNumber, passedTotalAmount]);

  const displayTransactionNumber =
    transactionNumber?.trim() || BANK_TRANSFER_SUCCESS_PAGE.NOT_PROVIDED_TEXT;

  return (
    <>
      <PageTitle title="Application submitted" />
            <div className="govuk-width-container">
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
                    {loading && !invoiceNumber
                      ? BANK_TRANSFER_SUCCESS_PAGE.LOADING_TEXT
                      : invoiceNumber || BANK_TRANSFER_SUCCESS_PAGE.NOT_AVAILABLE_TEXT}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    {BANK_TRANSFER_SUCCESS_PAGE.SUMMARY_LABELS.TOTAL_AMOUNT}
                  </th>
                  <td className="govuk-table__cell">
                    {totalAmount != null
                      ? formatCurrency(totalAmount)
                      : loading
                        ? BANK_TRANSFER_SUCCESS_PAGE.LOADING_TEXT
                        : BANK_TRANSFER_SUCCESS_PAGE.NOT_AVAILABLE_TEXT}
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
            <p className="govuk-body">{BANK_TRANSFER_SUCCESS_PAGE.INVOICE_INFO}</p>

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
          </div>
    </>
  );
};

export default BankTransferSuccessPage;
