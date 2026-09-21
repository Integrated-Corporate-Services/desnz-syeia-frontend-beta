import React from 'react';
import type { FurtherInformationRequest } from '../types';

const formatDate = (date: string) => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(date));

const formatDeadline = (date: string) => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${date}T00:00:00Z`));

const statusLabel = (status: FurtherInformationRequest['status']) =>
  status === 'OPEN' ? 'Not completed' : status === 'RESPONDED' ? 'Completed' : status.replaceAll('_', ' ');

export const FirRequestDetails: React.FC<{ request: FurtherInformationRequest }> = ({ request }) => (
  <details className="govuk-details">
    <summary className="govuk-details__summary">
      <span className="govuk-details__summary-text">See the information request</span>
    </summary>
    <section className="govuk-summary-card" aria-labelledby="fir-request-details-heading">
      <div className="govuk-summary-card__title-wrapper">
        <h2 className="govuk-summary-card__title" id="fir-request-details-heading">Further information request</h2>
      </div>
      <div className="govuk-summary-card__content">
        <dl className="govuk-summary-list">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Date requested</dt>
            <dd className="govuk-summary-list__value">{formatDate(request.createdAt)}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Request from case officer</dt>
            <dd className="govuk-summary-list__value">{request.requestText}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Deadline to respond</dt>
            <dd className="govuk-summary-list__value">{formatDeadline(request.deadlineAt)}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Status</dt>
            <dd className="govuk-summary-list__value"><strong className="govuk-tag govuk-tag--blue">{statusLabel(request.status)}</strong></dd>
          </div>
        </dl>
      </div>
    </section>
  </details>
);
