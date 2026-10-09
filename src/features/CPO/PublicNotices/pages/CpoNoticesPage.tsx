import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import FileUpload, { type FileUploadHandle } from '../../../../components/FileUpload';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { deleteDocument } from '../../../../services/s3ApiService';
import DateInput from '../components/DateInput';
import { cpoNoticesService } from '../services/cpoNoticesService';
import { NOTICE_CATEGORIES, NOTICE_STEPS } from '../constants/noticesConstants';
import type { NoticeAnswer, NoticesResponse, NoticeStep } from '../types/notices';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';
import CpoNoticeInspectionPage from './CpoNoticeInspectionPage';
import { inspectionAddresses, inspectionAddressText, noticeDateText, publicationDateForFile } from '../utils/noticeRecord';
import { ALLOWED_FILE_EXTENSIONS } from '../../../../utils/fileValidationConstants';

const HEADINGS: Record<NoticeStep, string> = {
  requirements: 'What your public notices must include', inspection: 'Record order inspection addresses',
  online: 'Enter the website address', newspapers: 'Record the newspaper notices',
  website: 'Record the website notice', site: 'Record the site notices', people: 'Upload a statement of service (optional)', check: 'Check public notices',
};
const LABELS: Partial<Record<NoticeStep, string>> = {
  requirements: 'Notice requirements',
  inspection: 'Inspection addresses', online: 'Enter the website address', newspapers: 'Record the newspaper notices',
  website: 'Website notice', site: 'Record the site notices', people: 'Statement of service', check: 'Public notices',
};
const formatDate = (value?: string) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))
  ? new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'Not recorded';
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
type FormError = { id: string; message: string };

const CpoNoticesFormPage: React.FC = () => {
  const { noticeStep = 'requirements' } = useParams();
  const applicationId = useCpoApplicationId();
  const [searchParams] = useSearchParams();
  const fromApplicationReview = searchParams.get('from') === 'application-review';
  const navigate = useNavigate();
  const location = useLocation();
  const legacyRequirements = location.pathname.endsWith('/notice-requirements');
  const step: NoticeStep = legacyRequirements ? 'requirements' : noticeStep === 'website' ? 'website' : NOTICE_STEPS.includes(noticeStep as typeof NOTICE_STEPS[number]) ? noticeStep as NoticeStep : 'requirements';
  const base = `${CPO_BASE_URL}/${applicationId}/record-notices`;
  const [data, setData] = useState<NoticesResponse>({ record: {}, documents: [], reference: '', objectionsEmail: '', finalObjectionDate: null });
  const [answer, setAnswer] = useState<NoticeAnswer>({});
  const [editingDate, setEditingDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshingUploads, setRefreshingUploads] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const uploadRef = useRef<FileUploadHandle>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const category = NOTICE_CATEGORIES[step];
  const documents = data.documents.filter((file) => file.category === category);
  const editable = data.canEdit !== false;
  const blocked = loading || loadFailed || saving || refreshingUploads || !editable;
  const errorFor = (id: string) => errors.find((error) => error.id === id)?.message;
  const update = (key: keyof NoticeAnswer, value: string) => setAnswer((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    if (legacyRequirements) navigate(`${base}/requirements${location.search}`, { replace: true });
  }, [legacyRequirements, base, location.search, navigate]);
  const backUrl = searchParams.get('from') === 'check' || fromApplicationReview
    ? `${base}/check${fromApplicationReview ? '?from=application-review' : ''}`
    : step === 'requirements' ? `${CPO_BASE_URL}/${applicationId}/task-list` : `${base}/${step === 'website' ? 'online' : NOTICE_STEPS[NOTICE_STEPS.indexOf(step) - 1]}`;
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadFailed(false); setErrors([]); setFileErrors([]); setEditingDate('');
    cpoNoticesService.get(applicationId).then((result) => {
      if (active) {
        setData(result);
        const saved = result.record[step] || {};
        const dates = [...new Set(saved.evidence?.map(entry => entry.date).filter(Boolean) || [])].sort();
        setAnswer(step === 'check' ? { confirmed: null } : step === 'newspapers' ? { ...saved, firstDate: saved.firstDate || dates[0] || '', secondDate: saved.secondDate || dates[1] || '' } : saved);
      }
    }).catch((failure) => { if (active) { setLoadFailed(true); setErrors([{ id: 'notices-heading', message: failure instanceof Error ? failure.message : 'Unable to load your publicity record. Refresh the page.' }]); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId, step]);
  useEffect(() => { if (errors.length) summaryRef.current?.focus(); }, [errors]);
  useEffect(() => { if (!loading) { if (loadFailed) summaryRef.current?.focus(); else headingRef.current?.focus(); } }, [loading, loadFailed, step]);

  const uploadEvidence = async (): Promise<NoticeAnswer> => {
    if (!uploadRef.current?.getPendingFiles().length) return answer;
    const uploaded = await uploadRef.current.triggerUpload();
    const evidence = [...(answer.evidence || []), ...uploaded.uploadedFiles.map(file => ({ fileId: file.id, date: answer.completionDate || '' }))];
    const nextAnswer = { ...answer, evidence };
    setAnswer(nextAnswer);
    if (uploaded.scanErrors.length) {
      const refreshed = await cpoNoticesService.get(applicationId);
      setData(refreshed);
      throw new Error(uploaded.scanErrors.join(' '));
    }
    return nextAnswer;
  };
  const submit = async (saveForLater: boolean) => {
    if (blocked) return;
    if (fileErrors.length) { setErrors(fileErrors.map((message) => ({ id: 'file-upload-input', message }))); return; }
    if (uploadRef.current?.isBusy()) { setErrors([{ id: 'file-upload-input', message: 'Wait for uploads and virus checks to finish before continuing' }]); return; }
    const localErrors: FormError[] = [];
    const dateKeys = step === 'newspapers' ? ['firstDate', 'secondDate'] as const : step === 'website' ? ['liveDate'] as const : step === 'site' || step === 'people' ? ['completionDate'] as const : [];
    for (const key of dateKeys) if (((!saveForLater && step !== 'people') || answer[key]) && !validDate(answer[key] || '')) localErrors.push({ id: `${key}-day`, message: `Enter a valid ${key === 'firstDate' ? 'first publication' : key === 'secondDate' ? 'second publication' : key === 'liveDate' ? 'notice live' : 'completion'} date` });
    if (!saveForLater && (step === 'inspection' ? !answer.address?.trim() : step === 'online' || step === 'website' ? !answer.url?.trim() : false)) localErrors.push({ id: 'notice-location', message: step === 'inspection' ? 'Enter the inspection address' : 'Enter the web address' });
    if (localErrors.length) { setErrors(localErrors); return; }
    setSaving(true); setErrors([]);
    try {
      const uploadedAnswer = await uploadEvidence();
      const nextAnswer: NoticeAnswer = step === 'requirements' ? { format: 'reference', acknowledged: !saveForLater || data.record.requirements?.acknowledged === true }
        : step === 'check' ? { format: 'reference', confirmed: !saveForLater } : { ...uploadedAnswer, format: 'reference' };
      if (category) nextAnswer.evidence = [
        ...documents.map(file => nextAnswer.evidence?.find(entry => entry.fileId === file.file_id) || { fileId: file.file_id, date: '' }),
        ...(nextAnswer.evidence || []).filter(entry => !documents.some(file => file.file_id === entry.fileId)),
      ];
      if (step === 'newspapers' && nextAnswer.evidence?.length === 2) nextAnswer.evidence = nextAnswer.evidence.map((entry, index) => ({ ...entry, date: publicationDateForFile(entry.fileId, index, nextAnswer, data.record.newspapers) }));
      if (step === 'site' || step === 'people') nextAnswer.evidence = nextAnswer.evidence?.map(entry => ({ ...entry, date: entry.date || nextAnswer.completionDate || '' }));
      const result = await cpoNoticesService.save(applicationId, step, nextAnswer, saveForLater);
      setData({ ...result, canEdit: data.canEdit }); setAnswer(nextAnswer);
      if (saveForLater) { navigate('/application-dashboard'); return; }
      if (step === 'check') navigate(`${CPO_BASE_URL}/${applicationId}/${fromApplicationReview ? 'check-and-submit' : 'task-list'}`);
      else navigate(`${base}/${searchParams.get('from') === 'check' || fromApplicationReview ? 'check' : step === 'website' ? 'site' : NOTICE_STEPS[NOTICE_STEPS.indexOf(step) + 1]}${fromApplicationReview ? '?from=application-review' : ''}`);
    } catch (failure) { setErrors([{ id: category ? 'file-upload-input' : 'notices-heading', message: failure instanceof Error ? failure.message : 'Unable to save your publicity record. Try again.' }]); }
    finally { setSaving(false); }
  };
  const textInput = (label: string, key: 'address' | 'url') => <div className={`govuk-form-group${errorFor('notice-location') ? ' govuk-form-group--error' : ''}`}>
    <label className={step === 'online' ? 'govuk-visually-hidden' : 'govuk-label govuk-label--s'} htmlFor="notice-location">{label}</label>
    {errorFor('notice-location') && <p className="govuk-error-message" id="notice-location-error">{errorFor('notice-location')}</p>}
    <input className={`govuk-input${errorFor('notice-location') ? ' govuk-input--error' : ''}`} id="notice-location" type={key === 'url' ? 'url' : 'text'} maxLength={key === 'url' ? 2000 : 1000} aria-describedby={errorFor('notice-location') ? 'notice-location-error' : undefined} value={answer[key] || ''} onChange={(event) => update(key, event.target.value)} />
  </div>;
  const dateInput = (key: 'from' | 'until' | 'liveDate' | 'completionDate' | 'firstDate' | 'secondDate', label: string) => <DateInput id={key} label={label} value={answer[key]} onChange={(value) => update(key, value)} error={errorFor(`${key}-day`)} />;
  const removeDocument = async (documentId: string, fileId: string) => {
    if (blocked) return;
    setSaving(true); setErrors([]);
    try {
      await deleteDocument(documentId);
      const nextAnswer = { ...answer, evidence: (answer.evidence || []).filter((item) => item.fileId !== fileId) };
      setAnswer(nextAnswer);
      setData((current) => ({ ...current, documents: current.documents.filter((file) => file.file_id !== fileId) }));
      const result = await cpoNoticesService.save(applicationId, step, nextAnswer, true);
      setData({ ...result, canEdit: data.canEdit }); setFileErrors([]);
    } catch (failure) { setErrors([{ id: 'file-upload-input', message: failure instanceof Error ? failure.message : 'Unable to delete the document. Try again.' }]); }
    finally { setSaving(false); }
  };
  const reviewValue = (target: typeof NOTICE_STEPS[number]) => {
    const saved = data.record[target] || {};
    if (target === 'requirements') return saved.acknowledged === true ? 'Read and acknowledged' : 'Not acknowledged';
    if (target === 'inspection') return inspectionAddresses(saved).map(address => <p className="govuk-body" key={address.id}>{inspectionAddressText(address)}<br />Available from {noticeDateText(address.from)}</p>);
    if (target === 'online') return <a className="govuk-link" href={saved.url} target="_blank" rel="noopener noreferrer">{saved.url || 'Not recorded'}</a>;
    return <>{data.documents.filter(file => file.category === NOTICE_CATEGORIES[target]).map(file => <p className="govuk-!-margin-bottom-1" key={file.file_id}><a className="govuk-link" href="#notices-heading" onClick={event => { event.preventDefault(); void downloadS3FileOnSameTab(file.s3_key, file.file_id, applicationId, file.document_id).catch(() => setErrors([{ id: 'notices-heading', message: 'Unable to download the document. Try again.' }])); }}>{file.filename}</a><br />{target === 'newspapers' ? 'Published' : target === 'site' ? 'Displayed' : 'Served'} {formatDate(saved.evidence?.find(item => item.fileId === file.file_id)?.date || saved.completionDate)}</p>)}{!saved.evidence?.length && (target === 'people' ? 'Not provided' : 'Not recorded')}</>;
  };
  return <>
    <PageTitle title={`${errors.length ? 'Error: ' : ''}${HEADINGS[step]}`} />
    <div className="govuk-width-container cpo-document-uploads cpo-notices-reference">
    <Link className="govuk-back-link govuk-!-margin-bottom-6" to={step === 'check' && fromApplicationReview ? `${CPO_BASE_URL}/${applicationId}/check-and-submit` : backUrl}>Back</Link>
    <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {!!errors.length && <div className="govuk-error-summary" ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="notices-error-title"><h2 className="govuk-error-summary__title" id="notices-error-title">There is a problem</h2><div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list">{errors.map((error, index) => <li key={index}><a href={`#${error.id}`}>{error.message}</a></li>)}</ul></div></div>}
      <span className="govuk-caption-l">Record your notices</span><h1 className="govuk-heading-l" id="notices-heading" ref={headingRef} tabIndex={-1}>{HEADINGS[step]}</h1>
      {loading && <p className="govuk-body" role="status">Loading publicity record...</p>}
      {!loading && !editable && <p className="govuk-body">You can view this publicity record but cannot change it.</p>}
      <form noValidate onSubmit={(event) => { event.preventDefault(); void submit(false); }}><fieldset className="govuk-fieldset" disabled={blocked}><legend className="govuk-visually-hidden">{HEADINGS[step]}</legend>
        {step === 'requirements' && <>
          <p className="govuk-body govuk-!-margin-bottom-0">Every notice must include the:</p><ul className="govuk-list govuk-list--bullet">
            <li>the DESNZ reference for this application: {data.reference || 'Not yet assigned'}</li>
            <li>email address objections can be sent to: <a className="govuk-link" href={`mailto:${data.objectionsEmail || 'compulsorypurchaseorders@energysecurity.gov.uk'}`}>{data.objectionsEmail || 'compulsorypurchaseorders@energysecurity.gov.uk'}</a></li>
            <li>layout and wording prescribed in <a className="govuk-link" href="https://www.legislation.gov.uk/uksi/2004/2595/made" target="_blank" rel="noopener noreferrer">The Compulsory Purchase of Land Regulations 2004 (opens in a new tab)</a> and <a className="govuk-link" href="https://www.legislation.gov.uk/uksi/2004/2595/contents" target="_blank" rel="noopener noreferrer">as amended in 2024 (opens in a new tab)</a></li>
          </ul><p className="govuk-body govuk-!-margin-bottom-0">We will ask you to confirm that you have provided notice:</p><ul className="govuk-list govuk-list--bullet"><li>on an appropriate website</li><li>in a newspaper for 2 successive weeks</li><li>on or near the land (site notice)</li><li>to every qualifying person</li></ul>
        </>}
        {step === 'online' && <><p className="govuk-body">Enter the website address (URL) where the order and maps can be viewed.</p>{textInput('Website address', 'url')}</>}
        {step === 'inspection' && <>
          <p className="govuk-body">Your notices must {step === 'inspection' ? 'name a place where people can see a copy of the order and the map' : 'give a website where people can view the order and the map'}. It must stay available until the final day for objections.</p>
          {textInput(step === 'inspection' ? 'Address where the order and map can be inspected' : 'Web address where the order and map can be viewed', step === 'inspection' ? 'address' : 'url')}
          {dateInput('from', step === 'inspection' ? 'Available for inspection from' : 'Available to view from')}
          {dateInput('until', step === 'inspection' ? 'Available for inspection until' : 'Available to view until')}
          {step === 'inspection' && <details className="govuk-details"><summary className="govuk-details__summary"><span className="govuk-details__summary-text">If you cannot provide a place for inspection</span></summary><div className="govuk-details__text"><p className="govuk-body">Ask DESNZ to dispense with the inspection place. It can only do this if special circumstances make it impracticable for you to provide one.</p><p className="govuk-body">Section 11(2A) of the Acquisition of Land Act 1981. The same direction removes the equivalent requirement in section 12(1)(ba). Contact DESNZ before continuing without an inspection place.</p></div></details>}
        </>}
        {step === 'website' && <><p className="govuk-body">Keep the notice available on an appropriate public website for at least 21 days up to and including the final day for objections.</p>{textInput('Web address of the notice', 'url')}{dateInput('liveDate', 'Date the notice went live')}</>}
        {category && <>
          {step === 'newspapers' ? <><p className="govuk-body">The public notice must be published in a local newspaper that circulates in the area where the land is located for 2 consecutive weeks.</p><p className="govuk-body">Enter the date it appeared each week and upload copies of the newspaper pages.</p></> : step === 'site' ? <><p className="govuk-body">Site notices are displayed on or near the affected land where people can read them.</p><p className="govuk-body govuk-!-margin-bottom-0">You only need to:</p><ul className="govuk-list govuk-list--bullet"><li>upload 1 copy of the site notice</li><li>enter the most recent date you put up a notice</li></ul></> : <p className="govuk-body">You can upload a statement of service confirming you have served a notice to every person named in the order. You do not need to list all their names.</p>}
          {!!documents.length && <><h2 className="govuk-heading-s">Documents uploaded</h2><dl className="govuk-summary-list cpo-notice-documents">{documents.map((file, index) => {
            const savedDate = answer.evidence?.find(item => item.fileId === file.file_id)?.date;
            const entryDate = step === 'newspapers' && documents.length === 2 ? publicationDateForFile(file.file_id, index, answer, data.record.newspapers) : answer.completionDate || savedDate;
            return <div className="govuk-summary-list__row" key={file.file_id}><dt className="govuk-summary-list__key" style={{ overflowWrap: 'anywhere' }}><a className="govuk-link" href="#notices-heading" onClick={(event) => { event.preventDefault(); void downloadS3FileOnSameTab(file.s3_key, file.file_id, applicationId, file.document_id).catch(() => setErrors([{ id: 'notices-heading', message: 'Unable to download this document. Try again.' }])); }}>{file.filename}</a></dt><dd className="govuk-summary-list__value">{step === 'newspapers' ? 'Published ' : step === 'people' ? 'Served ' : ''}{entryDate ? formatDate(entryDate) : 'Date not recorded'}{editable && step === 'newspapers' && documents.length > 2 && <><br /><button className="govuk-link cpo-notice-text-action" type="button" onClick={() => setEditingDate(editingDate === file.file_id ? '' : file.file_id)}>Change date<span className="govuk-visually-hidden"> for {file.filename}</span></button>{(editingDate === file.file_id || !savedDate) && <DateInput id={`evidence-${file.file_id}`} label={`Date for ${file.filename}`} value={savedDate} onChange={value => setAnswer(current => ({ ...current, evidence: [...(current.evidence || []).filter(item => item.fileId !== file.file_id), { fileId: file.file_id, date: value }] }))} />}</>}</dd>{editable && <dd className="govuk-summary-list__actions"><button className="govuk-link cpo-notice-text-action" type="button" onClick={() => void removeDocument(file.document_id, file.file_id)}>Delete<span className="govuk-visually-hidden"> {file.filename}</span></button></dd>}</div>;
          })}</dl></>}
          {editable && <>
            {errors.filter((error) => error.id === 'file-upload-input').map((error, index) => <p className="govuk-error-message" key={index} id={`upload-error-${index}`}>{error.message}</p>)}
            <FileUpload key={step} ref={uploadRef} title={step === 'newspapers' ? 'Upload copies of the newspaper pages' : step === 'site' ? 'Upload evidence of site notices' : 'Upload a statement of service (optional)'} titleHeadingLevel="h2" category={category} subCategory={step.toUpperCase()} applicationId={applicationId} prefix={`${applicationId}/${category}`} acceptedTypes={ALLOWED_FILE_EXTENSIONS.join(',')} hint={`You can upload ${ALLOWED_FILE_EXTENSIONS.join(', ')} files of up to 25MB each. Files cannot be password protected.`}
              uploadImmediately
              onUploaded={() => {
                setRefreshingUploads(true);
                void cpoNoticesService.get(applicationId).then(result => {
                  setData(result);
                }).catch(() => {
                  const message = 'Unable to refresh uploaded documents. Refresh the page before continuing.';
                  setFileErrors([message]); setErrors([{ id: 'file-upload-input', message }]);
                }).finally(() => setRefreshingUploads(false));
              }}
              inputDescribedBy={errors.filter((error) => error.id === 'file-upload-input').map((_error, index) => `upload-error-${index}`).join(' ') || undefined}
              showDocumentsHeading={false}
              uploadedFiles={documents.map((file) => ({ id: file.file_id, storageProvider: file.storage_provider, s3Key: file.s3_key, bucketName: file.bucket_name, virtualFolder: file.virtual_folder, filename: file.filename, fileContentType: file.file_content_type, fileSizeBytes: file.file_size_bytes, uploadedAtTimestamp: file.uploaded_at_timestamp, scanStatus: file.scan_status, scanResult: file.scan_result }))}
              applicationDocuments={documents.map((file) => ({ documentId: file.document_id, applicationId, fileId: file.file_id, category, subCategory: step.toUpperCase(), addedBy: file.added_by, addedAt: file.added_at }))}
              onDeleteFile={(id) => { setData((current) => ({ ...current, documents: current.documents.filter((file) => file.file_id !== id) })); setAnswer((current) => ({ ...current, evidence: (current.evidence || []).filter((item) => item.fileId !== id) })); }}
              onValidationErrors={(messages) => { setFileErrors(messages); setErrors(messages.map((message) => ({ id: 'file-upload-input', message }))); }} />
          </>}
          {step === 'newspapers' ? <>{dateInput('firstDate', 'First date it appeared')}{dateInput('secondDate', 'Second date it appeared')}</> : dateInput('completionDate', step === 'site' ? 'Enter the date you displayed the most recent notice' : 'Enter the date the last person was served a notice (optional)')}
        </>}
        {step === 'check' && <>
          <dl className="govuk-summary-list">
            {inspectionAddresses(data.record.inspection).map((address, index) => <div className="govuk-summary-list__row" key={address.id}><dt className="govuk-summary-list__key">Inspection address {index + 1}</dt><dd className="govuk-summary-list__value" style={{ overflowWrap: 'anywhere' }}>{inspectionAddressText(address)}<br />Available from {noticeDateText(address.from)}</dd><dd className="govuk-summary-list__actions"><Link className="govuk-link" to={`${base}/inspection?from=${fromApplicationReview ? 'application-review' : 'check'}`}>Change<span className="govuk-visually-hidden"> inspection address {index + 1}</span></Link></dd></div>)}
            {NOTICE_STEPS.filter(target => !['check', 'requirements', 'inspection'].includes(target)).map(target => <div className="govuk-summary-list__row" key={target}><dt className="govuk-summary-list__key">{LABELS[target]}</dt><dd className="govuk-summary-list__value" style={{ overflowWrap: 'anywhere' }}>{reviewValue(target)}</dd><dd className="govuk-summary-list__actions"><Link className="govuk-link" to={`${base}/${target}?from=${fromApplicationReview ? 'application-review' : 'check'}`}>Change<span className="govuk-visually-hidden"> {LABELS[target]?.toLowerCase()}</span></Link></dd></div>)}
          </dl>
        </>}
        {editable && <div className="govuk-button-group"><button className="govuk-button" type="submit">Save and continue</button><button className="govuk-button govuk-button--secondary" type="button" onClick={() => void submit(true)}>Save for later</button></div>}
      </fieldset></form>
      {saving && <p className="govuk-body" role="status">Saving publicity record...</p>}
    </div></div></div>
  </>;
};
const CpoNoticesPage: React.FC = () => {
  const { noticeStep } = useParams();
  return ['inspection', 'inspection-address', 'inspection-date'].includes(noticeStep || '') ? <CpoNoticeInspectionPage /> : <CpoNoticesFormPage />;
};
export default CpoNoticesPage;