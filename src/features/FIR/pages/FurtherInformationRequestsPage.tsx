import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadDocument } from '../../../utils/s3DownloadUtil';
import { FirErrorSummary } from '../components';
import { FIR_CATEGORY_LABELS, FIR_MESSAGES } from '../constants/fir.constants';
import { useFirRoute } from '../hooks';
import { getFurtherInformationRequest, getFurtherInformationRequests } from '../services';
import type { FurtherInformationRequest } from '../types';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';

const formatDate = (date: string) => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(date));

const statusLabel = (status: FurtherInformationRequest['status']) =>
  status === 'OPEN' ? 'Not completed' : status === 'RESPONDED' ? 'Completed' : status.replaceAll('_', ' ');

type ResponseDocument = NonNullable<FurtherInformationRequest['response']>['documents'][number];

const groupDocumentsByCategory = (documents: ResponseDocument[]) =>
  documents.reduce<Record<string, ResponseDocument[]>>((groups, document) => {
    (groups[document.documentCategory] ??= []).push(document);
    return groups;
  }, {});

const RequestCard: React.FC<{
  request: FurtherInformationRequest;
  title: string;
}> = ({ request, title }) => (
  <section className="govuk-summary-card govuk-!-margin-bottom-6">
    <div className="govuk-summary-card__title-wrapper">
      <h2 className="govuk-summary-card__title">{title}</h2>
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
          <dd className="govuk-summary-list__value">{request.status === 'OPEN'
            ? <strong className="govuk-tag govuk-tag--blue">{statusLabel(request.status)}</strong>
            : statusLabel(request.status)}</dd>
        </div>
        {request.response && <>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Submitted</dt>
            <dd className="govuk-summary-list__value">{formatDate(request.response.submittedAt)}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Which types of document will you be uploading?</dt>
            <dd className="govuk-summary-list__value">
              {request.response.documentCategories.map((category) => <div key={category}>{FIR_CATEGORY_LABELS[category] || category}</div>)}
            </dd>
          </div>
          {Object.entries(groupDocumentsByCategory(request.response.documents)).map(([category, documents]) => (
            <div className="govuk-summary-list__row" key={category}>
              <dt className="govuk-summary-list__key">{FIR_CATEGORY_LABELS[category] || category}</dt>
              <dd className="govuk-summary-list__value">
                <ul className="govuk-list">
                  {documents.map((document) => (
                    <li key={document.documentId}>
                      <a href="#" className="govuk-link" onClick={(event) => { event.preventDefault(); downloadDocument(document.documentId); }}>{document.filename}</a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
          {request.response.responseText && <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Additional comments (optional)</dt>
            <dd className="govuk-summary-list__value">{request.response.responseText}</dd>
          </div>}
        </>}
      </dl>
    </div>
  </section>
);

export const FurtherInformationRequestsPage: React.FC = () => {
  const { applicationId, requestPath } = useFirRoute();
  const [requests, setRequests] = useState<FurtherInformationRequest[]>([]);
  const [error, setError] = useState('');

  useBreadcrumb(
    <Link className="govuk-back-link" to={`${requestPath.replace('/further-information-requests', '')}/application-summary`}>Back</Link>
  );

  useEffect(() => {
    if (!applicationId) return;
    let active = true;
    void getFurtherInformationRequests(applicationId)
      .then(async (summaries) => {
        const detailedRequests = await Promise.all(summaries.map((request) =>
          request.status === 'OPEN'
            ? Promise.resolve(request)
            : getFurtherInformationRequest(applicationId, request.furtherInformationRequestId)
        ));
        if (active) setRequests(detailedRequests);
      })
      .catch(() => { if (active) setError(FIR_MESSAGES.REQUEST_LOAD_FAILED); });
    return () => { active = false; };
  }, [applicationId]);

  if (!applicationId) return null;

  const openRequests = requests.filter((request) => request.status === 'OPEN');
  const completedRequests = requests.filter((request) => request.status !== 'OPEN');

  return (
    <div className="govuk-grid-row">
     <div className="govuk-grid-column-two-thirds">
      {requests[0] && <span className="govuk-caption-l">{requests[0].desnzRef}</span>}
      <h1 className="govuk-heading-l">Further information requests</h1>
      <FirErrorSummary error={error} />
      {openRequests.map((request, index) => (
        <React.Fragment key={request.furtherInformationRequestId}>
          <RequestCard
            request={request}
            title={`Further information request ${openRequests.length - index}`}
          />
          <Link className="govuk-button" to={`${requestPath}/${request.furtherInformationRequestId}/respond`}>Provide information</Link>
        </React.Fragment>
      ))}
      {completedRequests.length > 0 && <>
        {openRequests.length > 0 && <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />}
        <h2 className="govuk-heading-m">Completed requests</h2>
        {completedRequests.map((request, index) => (
          <RequestCard
            key={request.furtherInformationRequestId}
            request={request}
            title={`Further information request ${completedRequests.length - index}`}
          />
        ))}
      </>}
     </div>
    </div>
  );
};
