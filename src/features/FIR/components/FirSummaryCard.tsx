import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFurtherInformationRequests } from '../services';
import type { FurtherInformationRequest } from '../types';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('FirSummaryCard');

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
      .then((result) => {
        if (!active) return;
        setRequests(result);
        if (!result.some((item) => item.status === 'OPEN')) {
          logger.debug('No open further information request to display', {
            applicationId,
            requestCount: result.length,
            statuses: result.map((item) => item.status),
          });
        }
      })
      .catch((reason: Error) => {
        if (active) setRequests([]);
        logger.error('Failed to load further information requests', { applicationId, error: reason.message });
      });
    return () => { active = false; };
  }, [applicationId]);

  // Render as soon as any FIR history exists, not just while one is currently OPEN,
  // so completed requests remain reachable via "View all information requests".
  if (requests.length === 0) return null;

  const openRequest = requests.find((item) => item.status === 'OPEN');

  return (
    <>
      {openRequest && (
        <>
          <section className="govuk-summary-card govuk-!-margin-top-6" aria-labelledby="fir-summary-heading">
            <div className="govuk-summary-card__title-wrapper">
              <h2 className="govuk-summary-card__title" id="fir-summary-heading">Further information request</h2>
            </div>
            <div className="govuk-summary-card__content">
              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Date requested</dt>
                  <dd className="govuk-summary-list__value">{formatDate(openRequest.createdAt)}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Request from case officer</dt>
                  <dd className="govuk-summary-list__value">{openRequest.requestText}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Deadline to respond</dt>
                  <dd className="govuk-summary-list__value">{formatDate(openRequest.deadlineAt)}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Status</dt>
                  <dd className="govuk-summary-list__value"><strong className="govuk-tag govuk-tag--blue">Not completed</strong></dd>
                </div>
              </dl>
            </div>
          </section>
          <Link className="govuk-button" to={`${basePath}/${openRequest.furtherInformationRequestId}/respond`}>Provide information</Link>
        </>
      )}
      <p><Link className="govuk-link" to={basePath}>View all information requests</Link></p>
    </>
  );
};
