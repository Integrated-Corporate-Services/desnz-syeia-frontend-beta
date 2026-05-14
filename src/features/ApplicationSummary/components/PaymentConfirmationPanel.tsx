import React from 'react';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { PaymentDetails, PaymentStatus } from '../types';
import { formatDate, formatCurrency, getCaseTypeLabel, getPaymentMethodLabel } from '../utils';

export interface PaymentConfirmationPanelProps {
    desnzRef?: string;
    applicationType: 'NWL' | 'S37' | 'TLP';
    payment: PaymentDetails;
}

export const PaymentConfirmationPanel: React.FC<PaymentConfirmationPanelProps> = ({
    desnzRef,
    applicationType,
    payment,
}) => {
    const isPaid = payment.status === PaymentStatus.PAID;
    const panelTitle = isPaid
        ? CONSTANTS.PAYMENT_PANEL.PAYMENT_RECEIVED
        : CONSTANTS.PAYMENT_PANEL.PAYMENT_PENDING;

    return (
        <div className={`govuk-panel ${isPaid ? 'govuk-panel--confirmation' : 'govuk-panel--warning'}`}>
            <h1 className="govuk-panel__title">{CONSTANTS.PAYMENT_PANEL.TITLE}</h1>
            <div className="govuk-panel__body">
                <strong>{panelTitle}</strong>
                {desnzRef && (
                    <>
                        <br />
                        {CONSTANTS.PAYMENT_PANEL.DESNZ_REFERENCE}
                        <br />
                        <strong>{desnzRef}</strong>
                    </>
                )}
            </div>
        </div>
    );
};

export interface PaymentDetailsSummaryProps {
    desnzRef?: string;
    applicationType: 'NWL' | 'S37' | 'TLP';
    payment: PaymentDetails;
}

export const PaymentDetailsSummary: React.FC<PaymentDetailsSummaryProps> = ({
    desnzRef,
    applicationType,
    payment,
}) => {
    return (
        <div className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-m">{CONSTANTS.SECTION_HEADINGS.PAYMENT_CONFIRMATION}</h2>
            <dl className="govuk-summary-list">
                {desnzRef && (
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">{CONSTANTS.PAYMENT_PANEL.DESNZ_REFERENCE}</dt>
                        <dd className="govuk-summary-list__value">{desnzRef}</dd>
                    </div>
                )}
                <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{CONSTANTS.PAYMENT_PANEL.CASE_TYPE}</dt>
                    <dd className="govuk-summary-list__value">{getCaseTypeLabel(applicationType)}</dd>
                </div>
                <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{CONSTANTS.PAYMENT_PANEL.APPLICATION_FEE}</dt>
                    <dd className="govuk-summary-list__value">{formatCurrency(payment.amount)}</dd>
                </div>
                {payment.paymentMethod && (
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">{CONSTANTS.PAYMENT_PANEL.PAYMENT_METHOD}</dt>
                        <dd className="govuk-summary-list__value">{getPaymentMethodLabel(payment.paymentMethod)}</dd>
                    </div>
                )}
                {payment.paidDate && (
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">{CONSTANTS.PAYMENT_PANEL.PAYMENT_DATE}</dt>
                        <dd className="govuk-summary-list__value">{formatDate(payment.paidDate)}</dd>
                    </div>
                )}
                {payment.invoiceNumber && (
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">{CONSTANTS.PAYMENT_PANEL.INVOICE_NUMBER}</dt>
                        <dd className="govuk-summary-list__value">{payment.invoiceNumber}</dd>
                    </div>
                )}
                {payment.transactionId && (
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">{CONSTANTS.PAYMENT_PANEL.TRANSACTION_ID}</dt>
                        <dd className="govuk-summary-list__value">{payment.transactionId}</dd>
                    </div>
                )}
            </dl>
        </div>
    );
};
