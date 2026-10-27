import { AdditionalPaymentRequest } from '../../../services/additionalPaymentsService';
import { ADDITIONAL_PAYMENT_RECEIPT_COPY as COPY, ADDITIONAL_PAYMENT_TITLES } from '../constants/additionalPayments';
import { additionalPaymentReceiptRows } from '../utils/additionalPaymentDisplay';
import { PaymentSummaryRow } from './PaymentSummaryRow';

export function AdditionalPaymentReceipt({ payment }: { payment: AdditionalPaymentRequest }) {
  const processing = payment.status === 'PROCESSING';
  return <>
    <div className="govuk-panel govuk-panel--confirmation">
      <h1 className="govuk-panel__title">{processing ? ADDITIONAL_PAYMENT_TITLES.processing : ADDITIONAL_PAYMENT_TITLES.paid}</h1>
    </div>
    <h2 className="govuk-heading-m">Payment Summary</h2>
    <dl className="govuk-summary-list govuk-!-margin-bottom-6">
      {additionalPaymentReceiptRows(payment).map(row => <PaymentSummaryRow key={row.label} label={row.label}>{row.value}</PaymentSummaryRow>)}
    </dl>
    {processing && <>
      <p className="govuk-body">{COPY.processingStatus}</p>
      <p className="govuk-body">{COPY.invoice}</p>
    </>}
    <h2 className="govuk-heading-m">What happens next</h2>
    <p className="govuk-body">{processing ? COPY.processingEmail : COPY.paidEmail}</p>
    <p className="govuk-body">{processing ? COPY.processingNext : COPY.paidNext}</p>
  </>;
}