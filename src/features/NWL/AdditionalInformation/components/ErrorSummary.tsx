import React from 'react';
import { FormErrors } from '../types';

interface ErrorSummaryProps {
  errors: FormErrors;
}

/**
 * Error summary component following GDS design
 */
export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors }) => {
  const errorKeys = Object.keys(errors);

  if (errorKeys.length === 0) {
    return null;
  }

  return (
    <div
      className="govuk-error-summary"
      aria-labelledby="error-summary-title"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      data-module="govuk-error-summary"
    >
      <h2 className="govuk-error-summary__title" id="error-summary-title">
        There is a problem
      </h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {errorKeys.map((key) => (
            <li key={key}>
              <a href={`#${key}`}>{errors[key]}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
