import { AdditionalPaymentRequest, additionalPaymentAmount } from '../../services/additionalPaymentsService';
import { additionalPaymentStatusText } from './AdditionalPaymentSummary';

export function AdditionalPaymentReceipt({ payment }: { payment: AdditionalPaymentRequest }) {
  const processing = payment.status === 'PROCESSING';
  const rows = [
    { label: processing ? 'Transaction number' : 'Reference number', value: processing ? payment.transaction_reference || 'Not provided' : payment.payment_reference || 'Not available' },
    { label: 'Invoice number', value: payment.invoice?.invoice_number || 'Not available' },
    { label: 'Total amount', value: additionalPaymentAmount(payment.amount_pence) },
    { label: 'Payment status', value: additionalPaymentStatusText[payment.status] },
  ];
  return <>
    <div className="govuk-panel govuk-panel--confirmation">
      <h1 className="govuk-panel__title">{processing ? 'Processing additional payment' : 'Payment received'}</h1>
    </div>
    <h2 className="govuk-heading-m">Payment Summary</h2>
    <dl className="govuk-summary-list govuk-!-margin-bottom-6">
      {rows.map(row => <div className="govuk-summary-list__row" key={row.label}>
        <dt className="govuk-summary-list__key">{row.label}</dt>
        <dd className="govuk-summary-list__value">{row.value}</dd>
      </div>)}
    </dl>
    {processing && <>
      <p className="govuk-body">Your application's payment status will show as 'Processing additional payment' until we have reconciled your payment.</p>
      <p className="govuk-body">You can find your invoice with all payment details in the application summary.</p>
    </>}
    <h2 className="govuk-heading-m">What happens next</h2>
    <p className="govuk-body">{processing ? 'We will email you when we have received and reconciled your payment.' : 'We will email you a receipt.'}</p>
    <p className="govuk-body">{processing ? 'The case officer will continue assessing your application while your payment is being processed.' : "Your application's payment status will show as 'Paid'. The case officer will continue assessing your application and will contact you with any follow-up actions."}</p>
  </>;
}