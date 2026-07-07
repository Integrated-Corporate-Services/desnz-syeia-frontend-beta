/**
 * Reusable Bank Details Panel Component
 * Displays DESNZ bank account information
 * Used in: BankTransferPaymentPage, BankTransferSuccessPage
 * 
 * @module components/payment
 */

import React from 'react';
import { BANK_DETAILS, formatCurrency } from '../../constants/payment';

interface BankDetailsPanelProps {
  invoiceNumber: string;
  totalAmount?: number;
  showAmount?: boolean;
}

/**
 * Bank Details Panel - DRY Component
 * Eliminates 40+ lines of duplicate code
 */
export const BankDetailsPanel: React.FC<BankDetailsPanelProps> = ({
  invoiceNumber,
  totalAmount,
  showAmount = false,
}) => {
  return (
    <div className="govuk-inset-text">
      <dl className="govuk-summary-list">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Account name</dt>
          <dd className="govuk-summary-list__value">{BANK_DETAILS.ACCOUNT_NAME}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Sort code</dt>
          <dd className="govuk-summary-list__value">{BANK_DETAILS.SORT_CODE}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Account number</dt>
          <dd className="govuk-summary-list__value">{BANK_DETAILS.ACCOUNT_NUMBER}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Payment reference</dt>
          <dd className="govuk-summary-list__value">
            <strong>{invoiceNumber || 'N/A'}</strong>
          </dd>
        </div>
        {showAmount && totalAmount !== undefined && (
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Amount</dt>
            <dd className="govuk-summary-list__value">
              <strong>{formatCurrency(totalAmount)}</strong>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
};

export default BankDetailsPanel;
