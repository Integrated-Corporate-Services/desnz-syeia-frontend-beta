import React from 'react';
import type { AssetFormErrors } from '../types';

interface ErrorSummaryProps {
  errors: AssetFormErrors;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors }) => {
  if (Object.keys(errors).length === 0) {
    return null;
  }

  // Helper to safely extract error message
  const getErrorMessage = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(v => 
        typeof v === 'object' && v !== null && 'message' in v 
          ? v.message 
          : String(v)
      ).join('; ');
    }
    if (typeof value === 'object' && value !== null) {
      if ('message' in value) {
        return String(value.message);
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

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
              <a href={`#${key}`}>{getErrorMessage(value)}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
