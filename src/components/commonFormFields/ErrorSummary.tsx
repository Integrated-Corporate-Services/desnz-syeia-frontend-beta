import React from "react";

interface ErrorSummaryError {
  fieldId: string;
  message: string;
}

interface ErrorSummaryProps {
  errors: ErrorSummaryError[];
  title?: string;
}

const ErrorSummary = React.forwardRef<HTMLDivElement, ErrorSummaryProps>(
  ({ errors, title = "There is a problem" }, ref) => {
    if (!errors || errors.length === 0) return null;

    return (
      <div
        ref={ref}
        className="govuk-error-summary"
        aria-labelledby="error-summary-title"
        role="alert"
        tabIndex={-1}
        data-module="govuk-error-summary"
      >
        <h2 className="govuk-error-summary__title" id="error-summary-title">
          {title}
        </h2>
        <div className="govuk-error-summary__body">
          <ul className="govuk-list govuk-error-summary__list">
            {errors.map((error, index) => (
              <li key={index}>
                {error.fieldId === "general" ? (
                  <span>{error.message}</span>
                ) : (
                  <a href={`#${error.fieldId}`}>{error.message}</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);

ErrorSummary.displayName = "ErrorSummary";

export default ErrorSummary;
