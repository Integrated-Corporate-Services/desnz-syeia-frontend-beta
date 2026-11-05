import React from 'react';

const valueStyle: React.CSSProperties = { overflowWrap: 'anywhere', whiteSpace: 'pre-line' };

export interface SummaryRowProps {
  label: string;
  children: React.ReactNode;
}

/** One GOV.UK summary-list row (key + value). */
export const SummaryRow: React.FC<SummaryRowProps> = ({ label, children }) => (
  <div className="govuk-summary-list__row">
    <dt className="govuk-summary-list__key govuk-!-width-one-half">{label}</dt>
    <dd className="govuk-summary-list__value" style={valueStyle}>{children}</dd>
  </div>
);

export default SummaryRow;
