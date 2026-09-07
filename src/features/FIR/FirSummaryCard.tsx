import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFurtherInformationRequests } from './fir.service';
import type { FurtherInformationRequest } from './fir.types';

interface FirSummaryCardProps {
  applicationId: string;
  basePath: string;
}

const formatDate = (date: string) => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(date));

export const FirSummaryCard: React.FC<FirSummaryCardProps> = ({ applicationId, basePath }) => {
  const [requests, setRequests] = useState<FurtherInformationRequest[]>([]);

  useEffect(() => {
    let active = true;
    void getFurtherInformationRequests(applicationId)
      .then((result) => { if (active) setRequests(result); })
      .catch(() => { if (active) setRequests([]); });
    return () => { active = false; };
  }, [applicationId]);

  const request = requests.find((item) => item.status === 'OPEN');
  if (!request) return null;

  return (
    <>
      <section className="govuk-summary-card govuk-!-margin-top-6" aria-labelledby="fir-summary-heading">
        <div className="govuk-summary-card__title-wrapper">
          <h2 className="govuk-summary-card__title" id="fir-summary-heading">Further information request</h2>
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
              <dd className="govuk-summary-list__value">{formatDate(request.deadlineAt)}</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Status</dt>
              <dd className="govuk-summary-list__value"><strong className="govuk-tag govuk-tag--blue">Not completed</strong></dd>
            </div>
          </dl>
        </div>
      </section>
      <Link className="govuk-button" to={`${basePath}/${request.furtherInformationRequestId}/respond`}>Provide information</Link>
      {requests.length > 1 && <p><Link className="govuk-link" to={basePath}>View all information requests</Link></p>}
    </>
  );
};