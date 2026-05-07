import React from 'react';
import type { AssetFormErrors } from '../types';

interface ErrorSummaryProps {
  errors: AssetFormErrors;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors }) => {
  if (Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div
      className="govuk-error-summary"
      data-module="govuk-error-summary"
      tabIndex={-1}
      role="alert"
    >
      <h2 className="govuk-error-summary__title">There is a problem</h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {Object.entries(errors).map(([key, value]) => (
            <li key={key}>
              <a href={`#${key}`}>{value}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
