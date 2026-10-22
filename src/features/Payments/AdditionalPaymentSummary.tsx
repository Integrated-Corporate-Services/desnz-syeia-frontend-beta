import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdditionalInvoiceLink } from './AdditionalInvoiceLink';
import { AdditionalPaymentError, AdditionalPaymentRequest, additionalPaymentAmount, listAdditionalPayments, validAdditionalAmount } from '../../services/additionalPaymentsService';

export const additionalPaymentStatusText = {
  NOT_PAID: 'Not paid', PROCESSING: 'Processing additional payment', PAID: 'Paid', WITHDRAWN: 'Request withdrawn',
};

export function AdditionalPaymentSummary({ applicationId, baseUrl }: { applicationId: string; baseUrl: string }) {
  const [requests, setRequests] = useState<AdditionalPaymentRequest[]>([]);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    listAdditionalPayments(applicationId).then(data => {
      if (active) setRequests(data.requests);
    }).catch(reason => {
      if (active && !(reason instanceof AdditionalPaymentError && reason.status === 404)) setError('Additional payment requests could not be loaded. Please try again.');
    });
    return () => { active = false; };
  }, [applicationId, retry]);
  if (error) return <div className="govuk-inset-text" role="alert"><p className="govuk-body">{error}</p><button className="govuk-button govuk-button--secondary" onClick={() => setRetry(value => value + 1)}>Try again</button></div>;
  return <>{requests.map(request => <section className="govuk-!-margin-bottom-6" key={request.request_id} aria-labelledby={`payment-${request.request_id}`}>
    <div className="govuk-summary-card govuk-!-margin-bottom-4">
    <div className="govuk-summary-card__title-wrapper"><h2 className="govuk-summary-card__title" id={`payment-${request.request_id}`}>Additional payment request</h2></div>
    <div className="govuk-summary-card__content">
      <dl className="govuk-summary-list">
        <Row label="Total amount">{additionalPaymentAmount(request.amount_pence)}</Row>
        <Row label="Date requested">{new Date(request.requested_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Row>
        <Row label="Invoice description">{request.description}</Row>
        {request.invoice && request.status !== 'WITHDRAWN' && <Row label="Invoice"><AdditionalInvoiceLink payment={request}>{request.invoice.invoice_number}.pdf</AdditionalInvoiceLink></Row>}
        {request.payment_method === 'CARD' && request.payment_reference && <Row label="Payment reference number">{request.payment_reference}</Row>}
        {request.payment_method === 'BACS' && <Row label="Transaction number">{request.transaction_reference || 'Not provided'}</Row>}
        <Row label="Payment status"><strong className={`govuk-tag govuk-tag--${request.status === 'PAID' ? 'green' : request.status === 'NOT_PAID' ? 'red' : request.status === 'WITHDRAWN' ? 'grey' : 'blue'}`}>{additionalPaymentStatusText[request.status]}</strong></Row>
      </dl>
    </div>
    </div>
    {request.status === 'NOT_PAID' && validAdditionalAmount(request.amount_pence) && <Link className="govuk-button" to={`${baseUrl}/${applicationId}/additional-payments/${request.request_id}`}>Make additional payment</Link>}
  </section>)}</>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">{label}</dt><dd className="govuk-summary-list__value">{children}</dd></div>;
}