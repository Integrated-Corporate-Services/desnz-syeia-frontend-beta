import { ADDITIONAL_PAYMENT_COPY as COPY, ADDITIONAL_PAYMENT_TITLES } from '../constants/additionalPayments';

export function AdditionalPaymentStatus({ status, onRetry }: { status: 'withdrawn' | 'pending' | 'unconfirmed' | 'unavailable'; onRetry: () => void }) {
  return <>
    {status !== 'unavailable' && <p className="govuk-body">{COPY[status]}</p>}
    {(status === 'pending' || status === 'unavailable') && <button className="govuk-button" onClick={onRetry}>
      {status === 'pending' ? 'Check payment status' : 'Try again'}
    </button>}
  </>;
}

export function AdditionalPaymentFailed({ actions }: { actions: React.ReactNode }) {
  return <>
    <div className="govuk-notification-banner">
      <div className="govuk-notification-banner__header"><h2 className="govuk-notification-banner__title">Important</h2></div>
      <div className="govuk-notification-banner__content"><h1 className="govuk-notification-banner__heading">{ADDITIONAL_PAYMENT_TITLES.result}</h1></div>
    </div>
    <p className="govuk-body">{COPY.noMoneyTaken}</p>
    <p className="govuk-body">Payments can fail if:</p>
    <ul className="govuk-list govuk-list--bullet">{COPY.failureReasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
    <h2 className="govuk-heading-m">What happens next</h2>
    <p className="govuk-body">{COPY.retryPayment}</p>
    {actions}
  </>;
}