import React from 'react';

export const FirErrorSummary: React.FC<{ error: string }> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="govuk-error-summary" role="alert">
      <h2 className="govuk-error-summary__title">There is a problem</h2>
      <p>{error}</p>
    </div>
  );
};
