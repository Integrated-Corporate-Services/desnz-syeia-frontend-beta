import React from 'react';
import { Link } from 'react-router-dom';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { DOCUMENT_CATEGORIES, DOCUMENT_GROUP_CATEGORIES } from '../../OrderDocuments/constants/orderDocumentsConstants';
import { NOTICE_CATEGORIES, NOTICE_HEADINGS } from '../../RecordNotices/constants/noticesConstants';
import type { NoticeStep } from '../../RecordNotices/types/notices';
import { inspectionAddresses, inspectionAddressText, noticeDateText } from '../../RecordNotices/utils/noticeRecord';
import type { CpoAnswers } from '../hooks/useCpoApplicationAnswers';

interface CpoApplicationAnswersProps {
  answers: CpoAnswers;
  applicationId: string;
  /** Shows a Change link on each editable card. Applicant details and the pre-application meeting never have one. */
  editable: boolean;
  onDownloadError: () => void;
}

interface AnswerFile {
  key: string;
  filename: string;
  s3Key: string;
  fileId: string;
  documentId: string;
  /** False while the virus check is still running or the file failed it. */
  clean: boolean;
  detail?: string;
}

const NOT_ANSWERED = 'Not answered';
const valueStyle: React.CSSProperties = { overflowWrap: 'anywhere', whiteSpace: 'pre-line' };

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="govuk-summary-list__row">
    <dt className="govuk-summary-list__key">{label}</dt>
    <dd className="govuk-summary-list__value" style={valueStyle}>{children}</dd>
  </div>
);

const Card: React.FC<{ title: string; changeUrl?: string; children: React.ReactNode }> = ({ title, changeUrl, children }) => (
  <div className="govuk-summary-card">
    <div className="govuk-summary-card__title-wrapper">
      <h3 className="govuk-summary-card__title">{title}</h3>
      {changeUrl && <ul className="govuk-summary-card__actions">
        <li className="govuk-summary-card__action">
          <Link className="govuk-link" to={changeUrl}>Change<span className="govuk-visually-hidden"> {title.toLowerCase()}</span></Link>
        </li>
      </ul>}
    </div>
    <div className="govuk-summary-card__content"><dl className="govuk-summary-list">{children}</dl></div>
  </div>
);

const meetingAnswer = ({ pre_submission_meeting_answer: answer, pre_submission_meeting_requested: requested }: CpoAnswers['application']) => {
  if (answer === 'Yes, I’ve had this meeting') return 'Yes';
  if (answer || typeof requested === 'boolean') return 'No';
  return NOT_ANSWERED;
};

const CpoApplicationAnswers: React.FC<CpoApplicationAnswersProps> = ({ answers, applicationId, editable, onDownloadError }) => {
  const { application, order, documents, notices } = answers;
  const base = `${CPO_BASE_URL}/${applicationId}`;
  const canDownload = application.permissions?.canDownload === true;
  const changeUrl = (path: string) => editable ? `${base}/${path}?from=application-review` : undefined;

  const fileList = (files: AnswerFile[], empty = 'Not uploaded') => files.length ? files.map((file) => <React.Fragment key={file.key}>
    <p className="govuk-!-margin-bottom-0">
      {canDownload && file.clean ? <a className="govuk-link" href="#" onClick={(event) => {
        event.preventDefault();
        void downloadS3FileOnSameTab(file.s3Key, file.fileId, applicationId, file.documentId).catch(onDownloadError);
      }}>{file.filename}</a> : file.filename}
      {!file.clean && ' (Virus check not complete)'}
    </p>
    {file.detail && <p className="govuk-!-margin-bottom-2">{file.detail}</p>}
  </React.Fragment>) : empty;

  const orderFiles = (categories: string[]): AnswerFile[] => documents.documents
    .filter((file) => categories.includes(file.category))
    .map((file) => ({ key: file.document_id, filename: file.filename, s3Key: file.s3_key, fileId: file.file_id, documentId: file.document_id, clean: file.scan_status === 'COMPLETED' && file.scan_result === 'CLEAN' }));

  const summaryFiles: AnswerFile[] = order.documents.map((file) => ({ key: file.document_id, filename: file.filename, s3Key: file.s3_key, fileId: file.file_id, documentId: file.document_id, clean: file.scan_status === 'COMPLETED' && file.scan_result === 'CLEAN' }));

  // Notice files only reach the record once uploaded; the download endpoint checks the scan itself.
  const noticeFiles = (step: NoticeStep, datedEach?: string): AnswerFile[] => notices.documents
    .filter((file) => file.category === NOTICE_CATEGORIES[step])
    .map((file) => {
      const date = notices.record[step]?.evidence?.find((entry) => entry.fileId === file.file_id)?.date;
      return { key: file.document_id, filename: file.filename, s3Key: file.s3_key, fileId: file.file_id, documentId: file.document_id, clean: true, detail: datedEach ? `${datedEach} ${noticeDateText(date)}` : undefined };
    });

  const completedNotice = (step: NoticeStep, label: string) => {
    const files = noticeFiles(step);
    const date = notices.record[step]?.completionDate;
    return <>{fileList(files)}{files.length > 0 && date && <p className="govuk-!-margin-bottom-0">{label} {noticeDateText(date)}</p>}</>;
  };

  const party = application.application_party;
  const additional = party?.additional_contact ?? application.additional_contact;
  const contacts = Array.isArray(additional) ? additional : additional?.split(',').map((value) => value.trim()).filter(Boolean) ?? [];
  const addresses = inspectionAddresses(notices.record.inspection);

  return <>
    <h2 className="govuk-heading-m">Applicant details</h2>
    <Card title="Applicant details">
      <Row label="Applicant name">{party?.organisation_name || NOT_ANSWERED}</Row>
      <Row label="Applicant contact name">{party?.contact_person_name || NOT_ANSWERED}</Row>
      <Row label="Address">{[party?.contact_person_line1, party?.contact_person_line2, party?.contact_person_city, party?.contact_person_county, party?.contact_person_postcode].filter(Boolean).join('\n') || NOT_ANSWERED}</Row>
      <Row label="Email address">{party?.contact_person_email || NOT_ANSWERED}</Row>
      <Row label="Phone number">{party?.contact_person_phone || NOT_ANSWERED}</Row>
      <Row label="Additional contacts">{contacts.join('\n') || 'None added'}</Row>
      <Row label="Applicant’s reference">{application.operator_ref || 'Not provided'}</Row>
    </Card>
    <Card title="Pre-application meeting">
      <Row label="Pre-application meeting">{meetingAnswer(application)}</Row>
      {application.pre_submission_meeting_answer === 'No, I don’t need this meeting' &&
        <Row label="Tell us why you don’t need this meeting">{application.pre_submission_meeting_reason || NOT_ANSWERED}</Row>}
      <Row label="DESNZ reference">{application.desnz_ref || notices.reference || 'Not yet assigned'}</Row>
    </Card>

    <h2 className="govuk-heading-m govuk-!-margin-top-8">Project information</h2>
    <Card title="Executive summary" changeUrl={changeUrl('order-details/executive-summary')}>
      <Row label="Executive summary">{fileList(summaryFiles)}</Row>
    </Card>
    <Card title="Order details" changeUrl={changeUrl('order-details/check')}>
      <Row label="Enter the order title">{order.details.orderName || NOT_ANSWERED}</Row>
      <Row label="Explain what the order is for">{order.details.purpose || NOT_ANSWERED}</Row>
    </Card>
    <Card title="Order documents" changeUrl={changeUrl('order-documents/check')}>
      <Row label="The order documents">{fileList(orderFiles(DOCUMENT_GROUP_CATEGORIES.order))}</Row>
      <Row label="Statement of reasons and related documents">{fileList(orderFiles([DOCUMENT_CATEGORIES.reasons]))}</Row>
      <Row label="Additional documents (optional)">{fileList(orderFiles([DOCUMENT_CATEGORIES.additional]), 'None uploaded')}</Row>
    </Card>

    <h2 className="govuk-heading-m govuk-!-margin-top-8">Public notices</h2>
    <Card title="Record your notices" changeUrl={changeUrl('record-notices/check')}>
      {addresses.length
        ? addresses.map((address, index) => <Row key={address.id} label={`Inspection address ${index + 1}`}>
          {inspectionAddressText(address)}{'\n'}Available from {noticeDateText(address.from)}
        </Row>)
        : <Row label="Inspection address">{NOT_ANSWERED}</Row>}
      <Row label={NOTICE_HEADINGS.online}>{notices.record.online?.url || NOT_ANSWERED}</Row>
      <Row label={NOTICE_HEADINGS.newspapers}>{fileList(noticeFiles('newspapers', 'Published'))}</Row>
      <Row label={NOTICE_HEADINGS.site}>{completedNotice('site', 'Displayed')}</Row>
      <Row label={NOTICE_HEADINGS.people}>{completedNotice('people', 'Last notice served')}</Row>
    </Card>
  </>;
};

export default CpoApplicationAnswers;
