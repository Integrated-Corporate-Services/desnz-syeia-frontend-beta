import React from 'react';
import type { FurtherInformationRequest } from '../types';

export const FirRequestDetails: React.FC<{ request: FurtherInformationRequest }> = ({ request }) => (
  <details className="govuk-details">
    <summary className="govuk-details__summary">
      <span className="govuk-details__summary-text">See the information request</span>
    </summary>
    <p className="govuk-body">{request.requestText}</p>
    <p className="govuk-body">
      Deadline to respond: {new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${request.deadlineAt}T00:00:00Z`))}
    </p>
  </details>
);
