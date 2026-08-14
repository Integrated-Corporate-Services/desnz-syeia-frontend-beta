import React from "react";

interface ErrorSummaryProps {
  errors: { field: string; message: string }[];
}

/**
 * Reusable GOV.UK error summary component
 */
const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div
      className="govuk-error-summary"
      data-module="govuk-error-summary"
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <h2 className="govuk-error-summary__title">There is a problem</h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {errors.map((error, index) => (
            <li key={index}>
              <a href={`#${error.field}`}>{error.message}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ErrorSummary;
