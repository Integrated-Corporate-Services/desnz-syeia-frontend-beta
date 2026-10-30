import { AdditionalPaymentRequest, additionalPaymentAmount } from '../../../services/additionalPaymentsService';
import { AdditionalInvoiceLink } from './AdditionalInvoiceLink';
import { ADDITIONAL_PAYMENT_COPY as COPY, ADDITIONAL_PAYMENT_ERRORS, ADDITIONAL_PAYMENT_TITLES } from '../constants/additionalPayments';

export function AdditionalPaymentBreakdown({ payment, amount, actionable, actions }: {
  payment: AdditionalPaymentRequest; amount: string; actionable: boolean; actions: React.ReactNode;
}) {
  return <>
    <p className="govuk-body">You must pay <strong>{amount}</strong> to settle this additional payment.</p>
    <p className="govuk-body">{COPY.breakdown}</p>
    <table className="govuk-table">
      <thead className="govuk-table__head"><tr className="govuk-table__row">
        <th className="govuk-table__header" scope="col">Item</th>
        <th className="govuk-table__header govuk-table__header--numeric" scope="col">Amount</th>
      </tr></thead>
      <tbody className="govuk-table__body">
        {payment.items.map((item, index) => <tr className="govuk-table__row" key={`${index}-${item.description}`}>
          <th scope="row" className="govuk-table__header">{item.description}</th>
          <td className="govuk-table__cell govuk-table__cell--numeric">{additionalPaymentAmount(item.amount_pence)}</td>
        </tr>)}
        <tr className="govuk-table__row"><th className="govuk-table__header" scope="row">TOTAL</th>
          <td className="govuk-table__cell govuk-table__cell--numeric"><strong>{amount}</strong></td></tr>
      </tbody>
    </table>
    <div className="govuk-inset-text">{COPY.generateInvoice}</div>
    {!actionable && <p className="govuk-error-message" role="alert">{ADDITIONAL_PAYMENT_ERRORS.amount}</p>}
    {actions}
  </>;
}

export function AdditionalPaymentInvoice({ payment, actions }: { payment: AdditionalPaymentRequest; actions: React.ReactNode }) {
  return <>
    {payment.invoice ? <>
      <p className="govuk-body">Your invoice number is:<br /><strong>{payment.invoice.invoice_number}</strong></p>
      <p className="govuk-body"><AdditionalInvoiceLink payment={payment} className="govuk-button govuk-button--secondary">Download invoice (PDF)</AdditionalInvoiceLink></p>
    </> : <p className="govuk-body">{COPY.missingInvoice}</p>}
    {actions}
  </>;
}

export function AdditionalPaymentGeneratingInvoice() {
  return <>
    <div className="govuk-notification-banner">
      <div className="govuk-notification-banner__header"><h2 className="govuk-notification-banner__title">Important</h2></div>
      <div className="govuk-notification-banner__content"><p className="govuk-notification-banner__heading">{COPY.generating}</p></div>
    </div>
    <div className="hods-loading-spinner" role="status">
      <div className="hods-loading-spinner__spinner" aria-hidden="true" />
      <div className="hods-loading-spinner__content"><h1 className="govuk-heading-m">{ADDITIONAL_PAYMENT_TITLES.generating}</h1></div>
    </div>
  </>;
}