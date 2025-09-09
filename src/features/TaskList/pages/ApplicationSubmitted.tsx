import React from 'react';

const ApplicationSubmitted: React.FC = () => (
  <div className="govuk-panel govuk-panel--confirmation">
    <h1 className="govuk-panel__title">Application submitted</h1>
    <div className="govuk-panel__body">
      Your application has been submitted successfully.<br />
      You will receive a confirmation email shortly.
    </div>
  </div>
);

export default ApplicationSubmitted;