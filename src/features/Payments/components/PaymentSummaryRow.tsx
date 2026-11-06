export function PaymentSummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="govuk-summary-list__row">
    <dt className="govuk-summary-list__key">{label}</dt>
    <dd className="govuk-summary-list__value">{children}</dd>
  </div>;
}