import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import {
  BANK_TRANSFER_SUCCESS_PAGE,
  PAYMENT_BUTTON_LABELS,
  formatCurrency,
} from '../../../constants/payment';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { applicationApiService } from '../../../services/applicationApiService';
import type { BankTransferSuccessState } from '../../../types/payment';
import { createLogger } from '../../../utils/logger';
import SkipLink from '../../../components/SkipLink';

const logger = createLogger('BankTransferSuccessPage');

const BankTransferSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();

  const {
    invoiceNumber,
    totalAmount,
    desnz_ref: passedDesnzRef,
    transactionNumber,
  } = (location.state as BankTransferSuccessState | null) || {};

  const [desnz_ref, setDesnzRef] = useState<string | undefined>(passedDesnzRef);
  const [loading, setLoading] = useState(!passedDesnzRef);
  const [error, setError] = useState<string | null>(null);

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

  const handleGoToSummary = () => {
    navigate(`${S37_BASE_URL}/${applicationId}/application-summary`);
  };

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
            <p className="govuk-body">{BANK_TRANSFER_SUCCESS_PAGE.INVOICE_INFO}</p>

            <h2 className="govuk-heading-m">{BANK_TRANSFER_SUCCESS_PAGE.WHAT_HAPPENS_NEXT_HEADING}</h2>
            <p className="govuk-body">{BANK_TRANSFER_SUCCESS_PAGE.EMAIL_CONFIRMATION}</p>
            <p className="govuk-body">{BANK_TRANSFER_SUCCESS_PAGE.FOLLOW_UP_INFO}</p>

            <div className="govuk-!-margin-top-6">
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={handleGoToSummary}
              >
                {PAYMENT_BUTTON_LABELS.VIEW_APPLICATION_SUMMARY}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default BankTransferSuccessPage;
