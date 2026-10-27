import { Link } from 'react-router-dom';
import { ADDITIONAL_PAYMENT_LABELS as LABELS } from '../constants/additionalPayments';

export function AdditionalPaymentBackLink({ summary, completed, failed }: { summary: string; completed: boolean; failed: boolean }) {
  return <Link className="govuk-button govuk-button--secondary" to={summary}>
    {completed ? LABELS.viewSummary : failed ? LABELS.returnSummary : LABELS.backSummary}
  </Link>;
}

export function AdditionalPaymentActions({ label, onClick, busy, disabled, back }: {
  label: string; onClick: () => void; busy: boolean; disabled: boolean; back: React.ReactNode;
}) {
  return <div className="govuk-button-group">
    <button type="button" className="govuk-button" disabled={busy || disabled} aria-busy={busy} onClick={onClick}>{label}</button>
    {back}
  </div>;
}