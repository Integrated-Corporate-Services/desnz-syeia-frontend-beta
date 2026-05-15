import React from 'react';

type ErrorSummaryProps = {
  errors: { [key: string]: string };
  errorFields: { [key: string]: string };
};

const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors, errorFields }) => {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" data-module="govuk-error-summary">
      <h2 className="govuk-error-summary__title" id="error-summary-title">
        There is a problem
      </h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {errorEntries.map(([key, message]) => (
            <li key={key}>
              <a href={`#${errorFields[key] || key}`}>{message}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ErrorSummary;
