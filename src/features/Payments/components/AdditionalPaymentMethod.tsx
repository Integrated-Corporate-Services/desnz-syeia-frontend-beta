import Details from '../../../components/Details';
import { BANK_DETAILS } from '../../../constants/payment';
import { ADDITIONAL_PAYMENT_COPY as COPY } from '../constants/additionalPayments';

export function AdditionalPaymentMethod({ amount, disabled, onBankTransfer, actions }: {
  amount: string; disabled: boolean; onBankTransfer: () => void; actions: React.ReactNode;
}) {
  return <>
    <p className="govuk-body">You must pay <strong>{amount}</strong> to settle this additional payment invoice.</p>
    <p className="govuk-body">{COPY.cardRedirect}</p>
    <p className="govuk-body">{COPY.fastest}</p>
    <Details id="additional-bank-transfer" summary={COPY.alternative}>
      <p className="govuk-body">{COPY.bankAlternative}</p>
      <p className="govuk-body">{COPY.bankProcessing}</p>
      <button className="govuk-button govuk-button--secondary" disabled={disabled} onClick={onBankTransfer}>Pay by bank transfer</button>
    </Details>
    {actions}
  </>;
}

export function AdditionalPaymentBankTransfer({ amount, invoiceNumber, confirmed, onConfirm, actions }: {
  amount: string; invoiceNumber?: string; confirmed: boolean; onConfirm: (confirmed: boolean) => void; actions: React.ReactNode;
}) {
  return <>
    <p className="govuk-body">{COPY.bankOnly}</p>
    <p className="govuk-body">You must pay <strong>{amount}</strong> using these banking details:</p>
    <ul className="govuk-list">
      <li><strong>Account name:</strong> {BANK_DETAILS.ACCOUNT_NAME}</li>
      <li><strong>Sort code:</strong> {BANK_DETAILS.SORT_CODE}</li>
      <li><strong>Account number:</strong> {BANK_DETAILS.ACCOUNT_NUMBER}</li>
      <li><strong>Payment reference:</strong> {invoiceNumber || 'Invoice unavailable'}</li>
    </ul>
    <div className="govuk-inset-text">{COPY.reference}</div>
    <div className="govuk-checkboxes govuk-!-margin-bottom-6"><div className="govuk-checkboxes__item">
      <input className="govuk-checkboxes__input" id="confirm-transfer" type="checkbox" checked={confirmed} onChange={event => onConfirm(event.target.checked)} />
      <label className="govuk-label govuk-checkboxes__label" htmlFor="confirm-transfer">{COPY.confirmTransfer}</label>
    </div></div>
    {actions}
  </>;
}