import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { CPO_BASE_URL } from '../../constants/cpo';
import { applicationApiService } from '../../services/applicationApiService';
import { progressApiService } from '../../services/progressApiService';
import { downloadS3FileOnSameTab } from '../../utils/s3DownloadUtil';
import { cpoOrderDetailsService, RELATED_TYPE_LABELS } from './cpoOrderDetailsService';
import type { OrderDetailsResponse, OrderDocument } from './cpoOrderDetailsService';
import { cpoOrderDocumentsService, DOCUMENT_CATEGORIES } from './cpoOrderDocumentsService';
import type { OrderDocumentsResponse } from './cpoOrderDocumentsService';
import { cpoNoticesService, NOTICE_CATEGORIES } from './cpoNoticesService';
import type { NoticesResponse, NoticeStep } from './cpoNoticesService';
import { CPO_SUBSECTIONS, CPO_TASK_SECTIONS } from './constants/cpoTaskListConstants';

interface ReviewApplication {
  type: string;
  status: string;
  pre_submission_meeting_requested?: boolean | null;
  additional_contact?: string | string[];
  permissions?: { canEdit?: boolean; canDownload?: boolean };
  application_party?: {
    organisation_name?: string;
    contact_person_name?: string;
    contact_person_line1?: string;
    contact_person_line2?: string;
    contact_person_city?: string;
    contact_person_county?: string;
    contact_person_postcode?: string;
    contact_person_email?: string;
    contact_person_phone?: string;
    additional_contact?: string | string[];
  };
}
interface ReviewData {
  application: ReviewApplication;
  order: OrderDetailsResponse;
  documents: OrderDocumentsResponse;
  notices: NoticesResponse;
  progress: { subsection_name: string; status: string }[];
}
const dateText = (value?: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value))) return 'Not recorded';
  return new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};
const choiceText = (value?: boolean | null) => typeof value === 'boolean' ? value ? 'Yes' : 'No' : 'Not answered';

const CpoCheckYourAnswersPage: React.FC = () => {
  const { applicationId = '' } = useParams();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const base = `${CPO_BASE_URL}/${applicationId}`;
  const heading = 'Check your answers before sending your application';
  useBreadcrumb(<div className="govuk-breadcrumbs"><ol className="govuk-breadcrumbs__list">
    <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={`${base}/task-list`}>Task list</Link></li>
    <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={`${base}/check-and-submit`}>Check and submit</Link></li>
  </ol></div>);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setData(null);
    Promise.all([
      applicationApiService.getApplicationById(applicationId),
      cpoOrderDetailsService.get(applicationId),
      cpoOrderDocumentsService.get(applicationId),
      cpoNoticesService.get(applicationId),
      progressApiService.fetchApplicationProgress(applicationId),
    ]).then(([application, order, documents, notices, progress]) => {
      if (application.type !== 'CPO') throw new Error('Compulsory purchase order application not found');
      if (active) setData({ application, order, documents, notices, progress });
    }).catch((failure) => { if (active) setError(failure instanceof Error ? failure.message : 'Unable to load your answers. Try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId, retry]);
  useEffect(() => { if (error) summaryRef.current?.focus(); }, [error]);
  useEffect(() => { if (!loading && !error) headingRef.current?.focus(); }, [loading, error]);
  const canEdit = data?.application.status.toLowerCase() === 'draft' && data.application.permissions?.canEdit === true
    && data.order.canEdit !== false && data.documents.canEdit !== false && data.notices.canEdit !== false;
  const canDownload = data?.application.permissions?.canDownload === true;
  const changeUrl = (path: string) => `${base}/${path}?from=application-review`;
  const row = (label: string, value: React.ReactNode, path: string) => <div className="govuk-summary-list__row" key={label}>
    <dt className="govuk-summary-list__key">{label}</dt>
    <dd className="govuk-summary-list__value" style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}>{value}</dd>
    {canEdit && <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={changeUrl(path)}>Change<span className="govuk-visually-hidden"> {label.toLowerCase()}</span></Link></dd>}
  </div>;
  const files = (documents: OrderDocument[], empty = 'Not uploaded') => documents.length ? documents.map((file) => <p className="govuk-!-margin-bottom-1" key={file.document_id}>
    {canDownload && file.scan_status === 'COMPLETED' && file.scan_result === 'CLEAN' ? <a className="govuk-link" href="#review-heading" onClick={(event) => {
      event.preventDefault();
      void downloadS3FileOnSameTab(file.s3_key, file.file_id, applicationId, file.document_id).catch(() => setError('Unable to download the document. Try again.'));
    }}>{file.filename}</a> : file.filename}
    {(file.scan_status !== 'COMPLETED' || file.scan_result !== 'CLEAN') && ' (Virus check not complete)'}
  </p>) : empty;
  const publicityFiles = (step: NoticeStep, label: string) => {
    if (!data) return null;
    const documents = data.notices.documents.filter((file) => file.category === NOTICE_CATEGORIES[step]);
    const answer = data.notices.record[step];
    return <>{documents.length ? documents.map((file) => <p className="govuk-!-margin-bottom-1" key={file.document_id}>{file.filename}: {dateText(answer?.evidence?.find((entry) => entry.fileId === file.file_id)?.date)}</p>) : 'Not uploaded'}{step !== 'newspapers' && <p className="govuk-!-margin-bottom-0">{label} {dateText(answer?.completionDate)}</p>}</>;
  };
  const party = data?.application.application_party;
  const additional = party?.additional_contact ?? data?.application.additional_contact;
  const contacts = Array.isArray(additional) ? additional : additional?.split(',').map((value) => value.trim()).filter(Boolean) || [];
  const incomplete = CPO_TASK_SECTIONS.flatMap((section) => section.tasks).filter((task) => task.subsection !== CPO_SUBSECTIONS.CHECK_AND_SUBMIT && !data?.progress.some((item) => item.subsection_name === task.subsection && item.status.toLowerCase() === 'completed'));
  return <>
    <PageTitle title={`${error ? 'Error: ' : ''}${heading}`} />
    <div className="govuk-width-container"><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {error && <div className="govuk-error-summary" ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="review-error-title"><h2 className="govuk-error-summary__title" id="review-error-title">There is a problem</h2><div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list"><li><a href="#review-heading">{error}</a></li></ul></div></div>}
      <h1 className="govuk-heading-l" id="review-heading" ref={headingRef} tabIndex={-1}>{heading}</h1>
      {loading && <p className="govuk-body" role="status">Loading your answers...</p>}
      {!loading && !data && <button className="govuk-button govuk-button--secondary" type="button" onClick={() => setRetry((current) => current + 1)}>Try again</button>}
      {data && <>
        {canEdit && incomplete.length > 0 && <><h2 className="govuk-heading-m">Complete these sections before submitting</h2><ul className="govuk-list govuk-list--bullet">{incomplete.map((task) => <li key={task.subsection}><Link className="govuk-link" to={`${base}/${task.slug}`}>{task.label}</Link></li>)}</ul></>}
        <h2 className="govuk-heading-m">Applicant details</h2>
        <dl className="govuk-summary-list">
          {row('Applicant name', party?.organisation_name || 'Not answered', 'applicant-details')}
          {row('Applicant contact name', party?.contact_person_name || 'Not answered', 'applicant-details')}
          {row('Address', [party?.contact_person_line1, party?.contact_person_line2, party?.contact_person_city, party?.contact_person_county, party?.contact_person_postcode].filter(Boolean).join('\n') || 'Not answered', 'applicant-details')}
          {row('Email address', party?.contact_person_email || 'Not answered', 'applicant-details')}
          {row('Phone number', party?.contact_person_phone || 'Not answered', 'applicant-details')}
          {row('Additional contacts', contacts.join('\n') || 'None added', 'applicant-details')}
          {row('Do you want a pre-submission meeting?', choiceText(data.application.pre_submission_meeting_requested), 'pre-submission-meeting')}
        </dl>
        <h2 className="govuk-heading-m govuk-!-margin-top-8">Order details</h2>
        <dl className="govuk-summary-list">
          {row('Name of the order', data.order.details.orderName || 'Not answered', 'order-details/name')}
          {row('What the order is for', data.order.details.purpose || 'Not answered', 'order-details/purpose')}
          {row('Common land, open space or allotment', choiceText(data.order.details.includesSpecialLand), 'order-details/special-land')}
          {data.order.details.includesSpecialLand && row('Land in exchange', choiceText(data.order.details.exchangeLand), 'order-details/exchange-land')}
          {row('Executive summary', files(data.order.documents), 'order-details/executive-summary')}
          {row('Related applications', data.order.details.hasRelatedApplications ? <><p className="govuk-!-margin-bottom-1">Yes. {data.order.details.relatedApplications.length} added.</p>{data.order.details.relatedApplications.map((entry) => <p className="govuk-!-margin-bottom-1" key={entry.id}>{entry.type === 'OTHER' ? entry.otherType : RELATED_TYPE_LABELS[entry.type]}{entry.reference && `: ${entry.reference}`}{entry.siteAddress && `\n${entry.siteAddress}`}{entry.relationship && `\n${entry.relationship}`}</p>)}</> : choiceText(data.order.details.hasRelatedApplications), 'order-details/related-applications')}
        </dl>
        <h2 className="govuk-heading-m govuk-!-margin-top-8">Public notices</h2>
        <dl className="govuk-summary-list">
          {row('Where the order can be inspected', <>{data.notices.record.inspection?.address || 'Not answered'}<br />From {dateText(data.notices.record.inspection?.from)} until {dateText(data.notices.record.inspection?.until)}</>, 'record-notices/inspection')}
          {row('Where the order can be viewed online', <>{data.notices.record.online?.url || 'Not answered'}<br />From {dateText(data.notices.record.online?.from)} until {dateText(data.notices.record.online?.until)}</>, 'record-notices/online')}
          {row('Newspaper notice', publicityFiles('newspapers', 'Published'), 'record-notices/newspapers')}
          {row('Website notice', <>{data.notices.record.website?.url || 'Not answered'}<br />Live from {dateText(data.notices.record.website?.liveDate)}</>, 'record-notices/website')}
          {row('Site notice', publicityFiles('site', 'Last notice affixed'), 'record-notices/site')}
          {row('Notice to qualifying persons', publicityFiles('people', 'Last person served'), 'record-notices/people')}
          {row('Final day for objections', dateText(data.notices.finalObjectionDate), 'record-notices/check')}
        </dl>
        <h2 className="govuk-heading-m govuk-!-margin-top-8">Order documents</h2>
        <dl className="govuk-summary-list">
          {row('The order', files(data.documents.documents.filter((file) => file.category === DOCUMENT_CATEGORIES.order)), 'order-documents/order')}
          {row('Order maps', files(data.documents.documents.filter((file) => file.category === DOCUMENT_CATEGORIES.maps)), 'order-documents/maps')}
          {row('Statement of reasons', files(data.documents.documents.filter((file) => file.category === DOCUMENT_CATEGORIES.reasons)), 'order-documents/reasons')}
          {row('Additional documents', files(data.documents.documents.filter((file) => file.category === DOCUMENT_CATEGORIES.additional), 'None uploaded'), 'order-documents/additional')}
        </dl>
      </>}
    </div></div></div>
  </>;
};
export default CpoCheckYourAnswersPage;