import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import FileUpload, { type FileUploadHandle } from '../../../components/FileUpload';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { CPO_BASE_URL } from '../../../constants/cpo';
import { downloadS3FileOnSameTab } from '../../../utils/s3DownloadUtil';
import { deleteDocument } from '../../../services/s3ApiService';
import DateInput from '../components/DateInput';
import { cpoNoticesService } from '../services/cpoNoticesService';
import { NOTICE_CATEGORIES, NOTICE_STEPS } from '../constants/noticesConstants';
import type { NoticeAnswer, NoticesResponse, NoticeStep } from '../types/notices';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';

const HEADINGS: Record<NoticeStep, string> = {
  requirements: 'What your public notices must include', inspection: 'Where can people inspect the order?',
  online: 'Where can people view the order online?', newspapers: 'Record the newspaper notices',
  website: 'Record the website notice', site: 'Record the site notices', people: 'Serve notices on each qualifying person', check: 'Check your publicity record',
};
const LABELS: Record<typeof NOTICE_STEPS[number], string> = {
  inspection: 'Where the order can be inspected', online: 'Where the order can be viewed online', newspapers: 'Newspaper notices',
  website: 'Website notice', site: 'Site notices', people: 'Qualifying persons', check: 'Publicity record',
};
const formatDate = (value?: string) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))
  ? new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'Not recorded';
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
type FormError = { id: string; message: string };

const CpoNoticesPage: React.FC = () => {
  const { noticeStep = 'inspection' } = useParams();
  const applicationId = useCpoApplicationId();
  const [searchParams] = useSearchParams();
  const fromApplicationReview = searchParams.get('from') === 'application-review';
  const navigate = useNavigate();
  const location = useLocation();
  const requirements = location.pathname.endsWith('/notice-requirements');
  const step: NoticeStep = requirements ? 'requirements' : NOTICE_STEPS.includes(noticeStep as typeof NOTICE_STEPS[number]) ? noticeStep as NoticeStep : 'inspection';
  const base = `${CPO_BASE_URL}/${applicationId}/record-notices`;
  const [data, setData] = useState<NoticesResponse>({ record: {}, documents: [], reference: '', objectionsEmail: '', finalObjectionDate: null });
  const [answer, setAnswer] = useState<NoticeAnswer>({});
  const [uploadDate, setUploadDate] = useState('');
  const [editingDate, setEditingDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const uploadRef = useRef<FileUploadHandle>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const category = NOTICE_CATEGORIES[step];
  const documents = data.documents.filter((file) => file.category === category);
  const editable = data.canEdit !== false;
  const blocked = loading || loadFailed || saving || !editable;
  const errorFor = (id: string) => errors.find((error) => error.id === id)?.message;
  const update = (key: keyof NoticeAnswer, value: string) => setAnswer((current) => ({ ...current, [key]: value }));
  useBreadcrumb(<div className="govuk-breadcrumbs"><ol className="govuk-breadcrumbs__list">
    <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={`${CPO_BASE_URL}/${applicationId}/task-list`}>Task list</Link></li>
    <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={requirements ? `${CPO_BASE_URL}/${applicationId}/notice-requirements` : base}>{requirements ? 'What your notices must include' : 'Record your notices'}</Link></li>
  </ol></div>);
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadFailed(false); setErrors([]); setFileErrors([]); setUploadDate(''); setEditingDate('');
    cpoNoticesService.get(applicationId).then((result) => {
      if (active) { setData(result); setAnswer(step === 'check' ? { confirmed: null } : result.record[step] || {}); }
    }).catch((failure) => { if (active) { setLoadFailed(true); setErrors([{ id: 'notices-heading', message: failure instanceof Error ? failure.message : 'Unable to load your publicity record. Refresh the page.' }]); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId, step]);
  useEffect(() => { if (errors.length) summaryRef.current?.focus(); }, [errors]);
  useEffect(() => { if (!loading) { if (loadFailed) summaryRef.current?.focus(); else headingRef.current?.focus(); } }, [loading, loadFailed, step]);

  const uploadEvidence = async (): Promise<NoticeAnswer> => {
    if (!uploadRef.current?.getPendingFiles().length) return answer;
    if (!validDate(uploadDate)) throw new Error('Enter a valid document date before uploading');
    const uploaded = await uploadRef.current.triggerUpload();
    const evidence = [...(answer.evidence || []), ...uploaded.uploadedFiles.map((file) => ({ fileId: file.id, date: uploadDate }))];
    const nextAnswer = { ...answer, evidence };
    setAnswer(nextAnswer);
    if (uploaded.scanErrors.length) {
      const refreshed = await cpoNoticesService.get(applicationId);
      setData(refreshed);
      throw new Error(uploaded.scanErrors.join(' '));
    }
    return nextAnswer;
  };
  const submit = async (saveForLater: boolean, uploadOnly = false) => {
    if (blocked) return;
    if (fileErrors.length) { setErrors(fileErrors.map((message) => ({ id: 'file-upload-input', message }))); return; }
    if (uploadRef.current?.isBusy()) { setErrors([{ id: 'file-upload-input', message: 'Wait for uploads and virus checks to finish before continuing' }]); return; }
    if (uploadOnly && !uploadRef.current?.getPendingFiles().length) { setErrors([{ id: 'file-upload-input', message: 'Choose a document to upload' }]); return; }
    const localErrors: FormError[] = [];
    const dateKeys = step === 'inspection' || step === 'online' ? ['from', 'until'] as const : step === 'website' ? ['liveDate'] as const : step === 'site' || step === 'people' ? ['completionDate'] as const : [];
    for (const key of dateKeys) if ((!saveForLater || answer[key]) && !validDate(answer[key] || '')) localErrors.push({ id: `${key}-day`, message: `Enter a valid ${key === 'from' ? 'available from' : key === 'until' ? 'available until' : key === 'liveDate' ? 'notice live' : 'completion'} date` });
    if (!saveForLater && step === 'check' && answer.confirmed !== true) localErrors.push({ id: 'confirmed-yes', message: answer.confirmed === false ? 'Use the Change links to correct your publicity record, then select yes' : 'Select yes if everything in this section is correct' });
    if (!saveForLater && (step === 'inspection' ? !answer.address?.trim() : step === 'online' || step === 'website' ? !answer.url?.trim() : false)) localErrors.push({ id: 'notice-location', message: step === 'inspection' ? 'Enter the inspection address' : 'Enter the web address' });
    if (uploadRef.current?.getPendingFiles().length && !validDate(uploadDate)) localErrors.push({ id: 'document-date-day', message: 'Enter a valid document date before uploading' });
    if (localErrors.length) { setErrors(localErrors); return; }
    setSaving(true); setErrors([]);
    try {
      const nextAnswer = step === 'requirements' ? { acknowledged: !saveForLater } : await uploadEvidence();
      const result = await cpoNoticesService.save(applicationId, step, nextAnswer, saveForLater || uploadOnly);
      setData({ ...result, canEdit: data.canEdit }); setAnswer(nextAnswer);
      if (uploadOnly) { setUploadDate(''); return; }
      if (saveForLater) { navigate('/application-dashboard'); return; }
      if (step === 'check') navigate(`${CPO_BASE_URL}/${applicationId}/${fromApplicationReview ? 'check-and-submit' : 'task-list'}`);
      else if (step === 'requirements') navigate(fromApplicationReview ? `${CPO_BASE_URL}/${applicationId}/check-and-submit` : base);
      else navigate(`${base}/${searchParams.get('from') === 'check' || fromApplicationReview ? 'check' : NOTICE_STEPS[NOTICE_STEPS.indexOf(step) + 1]}${fromApplicationReview ? '?from=application-review' : ''}`);
    } catch (failure) { setErrors([{ id: category ? 'file-upload-input' : 'notices-heading', message: failure instanceof Error ? failure.message : 'Unable to save your publicity record. Try again.' }]); }
    finally { setSaving(false); }
  };
  const textInput = (label: string, key: 'address' | 'url') => <div className={`govuk-form-group${errorFor('notice-location') ? ' govuk-form-group--error' : ''}`}>
    <label className="govuk-label govuk-label--s" htmlFor="notice-location">{label}</label>
    {errorFor('notice-location') && <p className="govuk-error-message" id="notice-location-error">{errorFor('notice-location')}</p>}
    <input className={`govuk-input${errorFor('notice-location') ? ' govuk-input--error' : ''}`} id="notice-location" type={key === 'url' ? 'url' : 'text'} maxLength={key === 'url' ? 2000 : 1000} aria-describedby={errorFor('notice-location') ? 'notice-location-error' : undefined} value={answer[key] || ''} onChange={(event) => update(key, event.target.value)} />
  </div>;
  const dateInput = (key: 'from' | 'until' | 'liveDate' | 'completionDate', label: string) => <DateInput id={key} label={label} value={answer[key]} onChange={(value) => update(key, value)} error={errorFor(`${key}-day`)} />;
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
    if (target === 'inspection' || target === 'online') return <>{target === 'inspection' ? saved.address || 'Not recorded' : saved.url || 'Not recorded'}<br />From {formatDate(saved.from)} until {formatDate(saved.until)}</>;
    if (target === 'website') return <>{saved.url || 'Not recorded'}<br />Live from {formatDate(saved.liveDate)}</>;
    return <>{data.documents.filter((file) => file.category === NOTICE_CATEGORIES[target]).map((file) => <p className="govuk-!-margin-bottom-1" key={file.file_id}>{file.filename}: {formatDate(saved.evidence?.find((item) => item.fileId === file.file_id)?.date)}</p>)}{!saved.evidence?.length && 'Not recorded'}{target !== 'newspapers' && <p className="govuk-!-margin-bottom-0">{target === 'site' ? 'Last notice affixed' : 'Last person served'} {formatDate(saved.completionDate)}</p>}</>;
  };
  return <>
    <PageTitle title={`${errors.length ? 'Error: ' : ''}${HEADINGS[step]}`} />
    <div className="govuk-width-container"><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {!!errors.length && <div className="govuk-error-summary" ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="notices-error-title"><h2 className="govuk-error-summary__title" id="notices-error-title">There is a problem</h2><div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list">{errors.map((error, index) => <li key={index}><a href={`#${error.id}`}>{error.message}</a></li>)}</ul></div></div>}
      <h1 className="govuk-heading-l" id="notices-heading" ref={headingRef} tabIndex={-1}>{HEADINGS[step]}</h1>
      {loading && <p className="govuk-body" role="status">Loading publicity record...</p>}
      {!loading && !editable && <p className="govuk-body">You can view this publicity record but cannot change it.</p>}
      <form noValidate onSubmit={(event) => { event.preventDefault(); void submit(false); }}><fieldset className="govuk-fieldset" disabled={blocked}><legend className="govuk-visually-hidden">{HEADINGS[step]}</legend>
        {step === 'requirements' && <>
          <p className="govuk-body">Publicity has four mandatory parts: newspaper notices for 2 successive weeks, a website notice, site notices on or near the land, and a notice served on every qualifying person. The wording is prescribed: use the notice forms as amended in 2024 (SI 2004/2595).</p>
          <p className="govuk-body">Every notice must include:</p><ul className="govuk-list govuk-list--bullet">
            <li>the DESNZ reference for this application: {data.reference || 'Not yet assigned'}</li>
            <li>where to object: {data.objectionsEmail ? <a className="govuk-link" href={`mailto:${data.objectionsEmail}`}>{data.objectionsEmail}</a> : <>ask DESNZ to confirm the objections address before publishing or serving notices</>}. Every notice must carry the confirmed address.</li>
            <li>where and when the order documents can be inspected, and the final day for objections</li>
          </ul><p className="govuk-body">Record all four publicity completion dates before completing this section. The final day for objections is calculated once the last publicity step is recorded. If dates change, check whether your notices need to change.</p>
        </>}
        {(step === 'inspection' || step === 'online') && <>
          <p className="govuk-body">Your notices must {step === 'inspection' ? 'name a place where people can see a copy of the order and the map' : 'give a website where people can view the order and the map'}. It must stay available until the final day for objections.</p>
          {textInput(step === 'inspection' ? 'Address where the order and map can be inspected' : 'Web address where the order and map can be viewed', step === 'inspection' ? 'address' : 'url')}
          {dateInput('from', step === 'inspection' ? 'Available for inspection from' : 'Available to view from')}
          {dateInput('until', step === 'inspection' ? 'Available for inspection until' : 'Available to view until')}
          {step === 'inspection' && <details className="govuk-details"><summary className="govuk-details__summary"><span className="govuk-details__summary-text">If you cannot provide a place for inspection</span></summary><div className="govuk-details__text"><p className="govuk-body">Ask DESNZ to dispense with the inspection place. It can only do this if special circumstances make it impracticable for you to provide one.</p><p className="govuk-body">Section 11(2A) of the Acquisition of Land Act 1981. The same direction removes the equivalent requirement in section 12(1)(ba). Contact DESNZ before continuing without an inspection place.</p></div></details>}
        </>}
        {step === 'website' && <><p className="govuk-body">Keep the notice available on an appropriate public website for at least 21 days up to and including the final day for objections.</p>{textInput('Web address of the notice', 'url')}{dateInput('liveDate', 'Date the notice went live')}</>}
        {category && <>
          <p className="govuk-body">{step === 'newspapers' ? 'The notice must appear for 2 successive weeks. Record the publication date for each insertion and upload the page as it appeared. If you published in more than one newspaper, add every insertion here.' : step === 'site' ? 'Fix notices to a conspicuous object or objects on or near the land, where they can be read. There is no required number and no required spacing. Use your judgement for the scheme. Record the date the last notice was fixed and upload your certificate of service. You do not need a photograph of every notice, but you can upload samples.' : 'Serve a notice on every owner, lessee, tenant and occupier of the land (Acquisition of Land Act 1981, section 12). You do not need to upload a copy of every letter. Upload your qualifying persons schedule and a certificate of service confirming that notice was served on everyone listed on it. Record the date service was completed on the last person. Service by email only counts where that person has agreed to it in writing.'}</p>
          {!!documents.length && <><h2 className="govuk-heading-s">Documents uploaded</h2><dl className="govuk-summary-list">{documents.map((file) => {
            const entryDate = answer.evidence?.find((item) => item.fileId === file.file_id)?.date;
            return <div className="govuk-summary-list__row" key={file.file_id}><dt className="govuk-summary-list__key" style={{ overflowWrap: 'anywhere' }}><a className="govuk-link" href="#notices-heading" onClick={(event) => { event.preventDefault(); void downloadS3FileOnSameTab(file.s3_key, file.file_id, applicationId, file.document_id).catch(() => setErrors([{ id: 'notices-heading', message: 'Unable to download this document. Try again.' }])); }}>{file.filename}</a></dt><dd className="govuk-summary-list__value">{step === 'newspapers' ? 'Published' : step === 'site' ? 'Affixed' : 'Updated or served'} {formatDate(entryDate)}{editable && <><br /><button className="govuk-link" style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }} type="button" onClick={() => setEditingDate(editingDate === file.file_id ? '' : file.file_id)}>Change date<span className="govuk-visually-hidden"> for {file.filename}</span></button></>}{editable && (editingDate === file.file_id || !entryDate) && <DateInput id={`evidence-${file.file_id}`} label={`Date for ${file.filename}`} value={entryDate} onChange={(value) => setAnswer((current) => ({ ...current, evidence: [...(current.evidence || []).filter((item) => item.fileId !== file.file_id), { fileId: file.file_id, date: value }] }))} />}</dd>{editable && <dd className="govuk-summary-list__actions"><button className="govuk-link" style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }} type="button" onClick={() => void removeDocument(file.document_id, file.file_id)}>Delete<span className="govuk-visually-hidden"> {file.filename}</span></button></dd>}</div>;
          })}</dl></>}
          {editable && <>
            {errors.filter((error) => error.id === 'file-upload-input').map((error, index) => <p className="govuk-error-message" key={index} id={`upload-error-${index}`}>{error.message}</p>)}
            <FileUpload key={step} ref={uploadRef} title={step === 'newspapers' ? 'Upload the newspaper pages or invoices' : step === 'site' ? 'Upload your certificate of service' : 'Upload the schedule and your certificate of service'} titleHeadingLevel="h2" category={category} subCategory={step.toUpperCase()} applicationId={applicationId} prefix={`${applicationId}/${category}`} acceptedTypes=".pdf,.jpg,.jpeg,.png,.docx,.xlsx" hint="You can upload .pdf, .jpg, .jpeg, .png, .docx and .xlsx files of up to 25MB each. You can add more than one file. Files cannot be password protected."
              inputDescribedBy={errors.filter((error) => error.id === 'file-upload-input').map((_error, index) => `upload-error-${index}`).join(' ') || undefined}
              showDocumentsHeading={false}
              uploadedFiles={documents.map((file) => ({ id: file.file_id, storageProvider: file.storage_provider, s3Key: file.s3_key, bucketName: file.bucket_name, virtualFolder: file.virtual_folder, filename: file.filename, fileContentType: file.file_content_type, fileSizeBytes: file.file_size_bytes, uploadedAtTimestamp: file.uploaded_at_timestamp, scanStatus: file.scan_status, scanResult: file.scan_result }))}
              applicationDocuments={documents.map((file) => ({ documentId: file.document_id, applicationId, fileId: file.file_id, category, subCategory: step.toUpperCase(), addedBy: file.added_by, addedAt: file.added_at }))}
              onDeleteFile={(id) => { setData((current) => ({ ...current, documents: current.documents.filter((file) => file.file_id !== id) })); setAnswer((current) => ({ ...current, evidence: (current.evidence || []).filter((item) => item.fileId !== id) })); }}
              onValidationErrors={(messages) => { setFileErrors(messages); setErrors(messages.map((message) => ({ id: 'file-upload-input', message }))); }} />
            <DateInput id="document-date" label={step === 'newspapers' ? 'Date of publication' : step === 'site' ? 'Date the notice was affixed' : 'Date the schedule was updated or notice was served'} value={uploadDate} onChange={setUploadDate} error={errorFor('document-date-day')} />
            <button className="govuk-button govuk-button--secondary" type="button" onClick={() => void submit(true, true)}>Upload document</button>
          </>}
          {step !== 'newspapers' && dateInput('completionDate', step === 'site' ? 'Date the final notice was affixed' : 'Date service on the last person completed')}
        </>}
        {step === 'check' && <>
          <dl className="govuk-summary-list">{NOTICE_STEPS.filter((target) => target !== 'check').map((target) => <div className="govuk-summary-list__row" key={target}><dt className="govuk-summary-list__key">{LABELS[target]}</dt><dd className="govuk-summary-list__value" style={{ overflowWrap: 'anywhere' }}>{reviewValue(target)}</dd><dd className="govuk-summary-list__actions"><Link className="govuk-link" to={`${base}/${target}?from=${fromApplicationReview ? 'application-review' : 'check'}`}>Change<span className="govuk-visually-hidden"> {LABELS[target].toLowerCase()}</span></Link></dd></div>)}</dl>
          <p className="govuk-body"><strong>Final day for objections:</strong> {formatDate(data.finalObjectionDate || undefined)}</p>
          <div className={`govuk-form-group${errorFor('confirmed-yes') ? ' govuk-form-group--error' : ''}`}><fieldset className="govuk-fieldset" aria-describedby={errorFor('confirmed-yes') ? 'confirmed-error' : undefined}><legend className="govuk-fieldset__legend govuk-fieldset__legend--m">Is everything in this section correct?</legend>{errorFor('confirmed-yes') && <p className="govuk-error-message" id="confirmed-error">{errorFor('confirmed-yes')}</p>}<div className="govuk-radios govuk-radios--inline">{[true, false].map((value) => <div className="govuk-radios__item" key={String(value)}><input className="govuk-radios__input" id={`confirmed-${value ? 'yes' : 'no'}`} name="confirmed" type="radio" checked={answer.confirmed === value} onChange={() => { setAnswer({ confirmed: value }); setErrors([]); }} /><label className="govuk-label govuk-radios__label" htmlFor={`confirmed-${value ? 'yes' : 'no'}`}>{value ? 'Yes' : 'No'}</label></div>)}</div></fieldset></div>
        </>}
        {editable && <div className="govuk-button-group"><button className="govuk-button" type="submit">Save and continue</button><button className="govuk-button govuk-button--secondary" type="button" onClick={() => void submit(true)}>Save for later</button></div>}
      </fieldset></form>
      {saving && <p className="govuk-body" role="status">Saving publicity record...</p>}
    </div></div></div>
  </>;
};
export default CpoNoticesPage;