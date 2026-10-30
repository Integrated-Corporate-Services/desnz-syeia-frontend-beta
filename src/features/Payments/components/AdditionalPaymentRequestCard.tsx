import { Link } from 'react-router-dom';
import { AdditionalPaymentRequest, additionalPaymentAmount, validAdditionalAmount } from '../../../services/additionalPaymentsService';
import { additionalPaymentStatusText, ADDITIONAL_PAYMENT_STATUS_COLOURS } from '../constants/additionalPayments';
import { additionalPaymentDate } from '../utils/additionalPaymentDisplay';
import { AdditionalInvoiceLink } from './AdditionalInvoiceLink';
import { PaymentSummaryRow as Row } from './PaymentSummaryRow';

export function AdditionalPaymentRequestCard({ request, applicationId, baseUrl }: {
  request: AdditionalPaymentRequest; applicationId: string; baseUrl: string;
}) {
  return <section className="govuk-!-margin-bottom-6" aria-labelledby={`payment-${request.request_id}`}>
    <div className="govuk-summary-card govuk-!-margin-bottom-4">
      <div className="govuk-summary-card__title-wrapper">
        <h2 className="govuk-summary-card__title" id={`payment-${request.request_id}`}>Additional payment request</h2>
      </div>
      <div className="govuk-summary-card__content"><dl className="govuk-summary-list">
        <Row label="Total amount">{additionalPaymentAmount(request.amount_pence)}</Row>
        <Row label="Date requested">{additionalPaymentDate(request.requested_at)}</Row>
        <Row label="Invoice description">{request.description}</Row>
        {request.invoice && request.status !== 'WITHDRAWN' && <Row label="Invoice"><AdditionalInvoiceLink payment={request}>{request.invoice.invoice_number}.pdf</AdditionalInvoiceLink></Row>}
        {request.payment_method === 'CARD' && request.payment_reference && <Row label="Payment reference number">{request.payment_reference}</Row>}
        {request.payment_method === 'BACS' && <Row label="Transaction number">{request.transaction_reference || 'Not provided'}</Row>}
        <Row label="Payment status"><strong className={`govuk-tag govuk-tag--${ADDITIONAL_PAYMENT_STATUS_COLOURS[request.status]}`}>{additionalPaymentStatusText[request.status]}</strong></Row>
      </dl></div>
    </div>
    {request.status === 'NOT_PAID' && validAdditionalAmount(request.amount_pence) && <Link className="govuk-button" to={`${baseUrl}/${applicationId}/additional-payments/${request.request_id}`}>Make additional payment</Link>}
  </section>;
}