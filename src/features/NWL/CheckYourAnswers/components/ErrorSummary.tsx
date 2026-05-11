import React from 'react';

interface ErrorSummaryProps {
  errors: { [key: string]: string };
}

/**
 * Error Summary component following GDS Design System
 * Displays validation errors at the top of the page
 */
export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors }) => {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <div
      className="govuk-error-summary"
      data-module="govuk-error-summary"
      aria-labelledby="error-summary-title"
      role="alert"
      tabIndex={-1}
    >
      <h2 className="govuk-error-summary__title" id="error-summary-title">
        There is a problem
      </h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {errorEntries.map(([key, message]) => (
            <li key={key}>
              <a href={`#${key}`}>{message}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
