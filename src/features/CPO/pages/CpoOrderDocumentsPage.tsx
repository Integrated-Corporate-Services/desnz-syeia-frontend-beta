import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import FileUpload, { type FileUploadHandle } from '../../../components/FileUpload';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { CPO_BASE_URL } from '../../../constants/cpo';
import { downloadS3FileOnSameTab } from '../../../utils/s3DownloadUtil';
import { cpoOrderDocumentsService } from '../services/cpoOrderDocumentsService';
import { DOCUMENT_CATEGORIES, DOCUMENT_STEPS } from '../constants/orderDocumentsConstants';
import type { CpoDocument, DocumentStep, OrderDocumentsResponse, UploadStep } from '../types/orderDocuments';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';

const COPY: Record<UploadStep, { heading: string; description: string; uploadTitle: string; hint: string; guidanceTitle: string; points: string[] }> = {
  order: {
    heading: 'Upload the order', description: 'The order is the legal document that lets you acquire the land once it is confirmed. Upload the sealed version, not a draft.',
    uploadTitle: 'Upload the sealed order and an unsealed copy', hint: 'Upload the sealed order and the unsealed copy as separate files.', guidanceTitle: 'What the order must contain',
    points: ['section 10 of and Schedule 3 to the Electricity Act 1989, and the purpose', 'every plot, and any new rights, listed in the schedule', 'the name and address of every qualifying person', 'a seal, signature and date, all on the same day'],
  },
  maps: {
    heading: 'Upload the order maps', description: 'The order maps show which land the order affects. They form part of the order, so they must be sealed and dated on the same day.',
    uploadTitle: 'Upload the sealed order maps and an unsealed copy', hint: 'Upload each sheet as a separate file. If there is more than one sheet, include a key plan showing how they fit together.', guidanceTitle: 'What the maps must show',
    points: ['Ordnance Survey mapping at 1:1250 or better, 1:2500 in rural areas, 1:500 in densely built-up areas', 'every plot numbered to match the schedule', 'land to be acquired, land for new rights and exchange land shown differently: by convention pink, blue and green', 'a heading matching paragraph 2 of the order'],
  },
  reasons: {
    heading: 'Upload the statement of reasons', description: 'The statement of reasons is your written case for the order. Upload the version you are submitting with it.',
    uploadTitle: 'Upload the statement of reasons', hint: 'Upload each document as a separate file.', guidanceTitle: 'What to cover',
    points: ['the order land: where it is and how it is used now', 'the power you are using: section 10 of and Schedule 3 to the Electricity Act 1989', 'why compulsory powers are justified in the public interest', 'your human rights and Public Sector Equality Duty assessment', 'the planning position, funding and any consent the scheme still needs', 'what you have done to buy the land or rights by agreement', 'any related application that needs a coordinated decision'],
  },
  additional: {
    heading: 'Upload additional documents (optional)', description: 'Upload anything your statement of reasons refers to.', uploadTitle: 'Upload any relevant documents',
    hint: 'Upload each document as a separate file.', guidanceTitle: 'Examples of additional documents',
    points: ['planning permission, or evidence of the planning position', 'evidence of funding', 'your record of attempts to buy the land or rights by agreement', 'environmental or habitats assessments', 'a list of documents you would rely on at an inquiry'],
  },
};
const SUMMARY_LABELS: Record<UploadStep, string> = { order: 'The order', maps: 'The order maps', reasons: 'Statement of reasons', additional: 'Additional documents' };
type DocumentError = { id: string; message: string };

const CpoOrderDocumentsPage: React.FC = () => {
  const { documentStep = 'order' } = useParams();
  const applicationId = useCpoApplicationId();
  const step: DocumentStep = DOCUMENT_STEPS.includes(documentStep as DocumentStep) ? documentStep as DocumentStep : 'order';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromApplicationReview = searchParams.get('from') === 'application-review';
  const fromCheck = searchParams.get('from') === 'check' || fromApplicationReview;
  const [data, setData] = useState<OrderDocumentsResponse>({ orderDetails: {}, documents: [] });
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<DocumentError[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const uploadRef = useRef<FileUploadHandle>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const base = `${CPO_BASE_URL}/${applicationId}/order-documents`;
  const heading = step === 'check' ? 'Check order documents' : COPY[step].heading;
  const editable = data.canEdit !== false;
  const category = step === 'check' ? '' : DOCUMENT_CATEGORIES[step];
  const pageDocuments = data.documents.filter((document) => document.category === category);

  useBreadcrumb(<div className="govuk-breadcrumbs"><ol className="govuk-breadcrumbs__list">
    <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={`${CPO_BASE_URL}/${applicationId}/task-list`}>Task list</Link></li>
    <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={base}>Order documents</Link></li>
  </ol></div>);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setErrors([]);
    setFileErrors([]);
    setConfirmed(null);
    cpoOrderDocumentsService.get(applicationId).then((result) => { if (active) setData(result); })
      .catch((failure) => {
        if (active) {
          setLoadFailed(true);
          setErrors([{ id: 'documents-heading', message: failure instanceof Error ? failure.message : 'Unable to load documents. Refresh the page.' }]);
        }
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId, step]);

  useEffect(() => { if (errors.length) errorSummary.current?.focus(); }, [errors]);
  useEffect(() => {
    if (!loading) {
      if (loadFailed) errorSummary.current?.focus();
      else headingRef.current?.focus();
    }
  }, [loading, loadFailed, step]);

  const save = async (saveForLater: boolean) => {
    if (loading || loadFailed || saving || !editable) return;
    if (step === 'check' && !saveForLater && confirmed !== true) {
      setErrors([{ id: 'documents-correct-yes', message: confirmed === false ? 'Use the Change links to correct your documents, then select yes' : 'Select yes if everything in this section is correct' }]);
      return;
    }
    if (fileErrors.length) { setErrors(fileErrors.map((message) => ({ id: 'file-upload-input', message }))); return; }
    if (uploadRef.current?.isBusy()) { setErrors([{ id: 'file-upload-input', message: 'Wait for uploads and virus checks to finish before continuing' }]); return; }
    setSaving(true);
    setErrors([]);
    try {
      if (uploadRef.current) {
        const result = await uploadRef.current.triggerUpload();
        if (result.scanErrors.length) { setErrors(result.scanErrors.map((message) => ({ id: 'file-upload-input', message }))); return; }
      }
      const result = await cpoOrderDocumentsService.save(applicationId, step, saveForLater, confirmed);
      setData((current) => ({ ...result, canEdit: current.canEdit }));
      if (saveForLater) { navigate('/application-dashboard'); return; }
      const next = fromCheck ? 'check' : DOCUMENT_STEPS[DOCUMENT_STEPS.indexOf(step) + 1];
      navigate(step === 'check' ? `${CPO_BASE_URL}/${applicationId}/${fromApplicationReview ? 'check-and-submit' : 'task-list'}` : `${base}/${next}${fromApplicationReview ? '?from=application-review' : ''}`);
    } catch (failure) {
      setErrors([{ id: step === 'check' ? 'documents-heading' : 'file-upload-input', message: failure instanceof Error ? failure.message : 'Unable to save documents. Try again.' }]);
    } finally { setSaving(false); }
  };

  const refreshDocuments = () => {
    void cpoOrderDocumentsService.get(applicationId).then((result) => setData(result))
      .catch(() => setErrors([{ id: 'file-upload-input', message: 'Unable to refresh uploaded documents. Refresh the page.' }]));
  };
  const readOnlyDocuments = (documents: CpoDocument[]) => <ul className="govuk-list">{documents.map((document) => <li key={document.document_id}>
    <a className="govuk-link" href="#documents-heading" onClick={(event) => {
      event.preventDefault();
      void downloadS3FileOnSameTab(document.s3_key, document.file_id, applicationId, document.document_id)
        .catch(() => setErrors([{ id: 'documents-heading', message: 'Unable to download the document. Try again.' }]));
    }}>{document.filename}</a>
  </li>)}</ul>;

  return <>
    <PageTitle title={`${errors.length ? 'Error: ' : ''}${heading}`} />
    <div className="govuk-width-container cpo-order-details"><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {errors.length > 0 && <div className="govuk-error-summary" ref={errorSummary} tabIndex={-1} role="alert" aria-labelledby="documents-error-title">
        <h2 className="govuk-error-summary__title" id="documents-error-title">There is a problem</h2>
        <div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list">{errors.map((error, index) => <li key={`${error.id}-${index}`}><a href={`#${error.id}`}>{error.message}</a></li>)}</ul></div>
      </div>}
      <h1 className="govuk-heading-l" id="documents-heading" tabIndex={-1} ref={headingRef}>{heading}</h1>
      {loading && <p className="govuk-body" role="status">Loading order documents...</p>}
      {!loading && !editable && <p className="govuk-body" role="status">You can view these documents but cannot change them.</p>}
      <form onSubmit={(event) => { event.preventDefault(); void save(false); }}>
        <fieldset className="govuk-fieldset" disabled={loading || loadFailed || saving || !editable}>
          <legend className="govuk-visually-hidden">{heading}</legend>
          {step !== 'check' ? <>
            <p className="govuk-body" id="documents-hint">{COPY[step].description}{step === 'order' && data.orderDetails.includesSpecialLand === false && ' Your answers mean it must use Form 1.'}</p>
            {errors.filter((error) => error.id === 'file-upload-input').map((error, index) => <p className="govuk-error-message" id={`documents-upload-error-${index}`} key={index}><span className="govuk-visually-hidden">Error:</span> {error.message}</p>)}
            {editable ? <FileUpload key={step} ref={uploadRef} title={COPY[step].uploadTitle} titleHeadingLevel="h2" category={category} subCategory={step.toUpperCase()} applicationId={applicationId} prefix={`${applicationId}/${category}`} acceptedTypes=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
              hint={`You can upload .pdf, .jpg, .jpeg, .png, .docx and .xlsx files of up to 25MB each. Files cannot be password protected. ${COPY[step].hint}`}
              inputDescribedBy={['documents-hint', ...errors.filter((error) => error.id === 'file-upload-input').map((_error, index) => `documents-upload-error-${index}`)].join(' ')}
              uploadedFiles={pageDocuments.map((document) => ({ id: document.file_id, storageProvider: document.storage_provider, s3Key: document.s3_key, bucketName: document.bucket_name, virtualFolder: document.virtual_folder, filename: document.filename, fileContentType: document.file_content_type, fileSizeBytes: document.file_size_bytes, uploadedAtTimestamp: document.uploaded_at_timestamp, scanStatus: document.scan_status, scanResult: document.scan_result }))}
              applicationDocuments={pageDocuments.map((document) => ({ documentId: document.document_id, applicationId, fileId: document.file_id, category, subCategory: step.toUpperCase(), addedBy: document.added_by, addedAt: document.added_at }))}
              onUploaded={refreshDocuments} onDeleteFile={(id) => setData((current) => ({ ...current, documents: current.documents.filter((document) => document.file_id !== id) }))}
              onValidationErrors={(messages) => { setFileErrors(messages); setErrors(messages.map((message) => ({ id: 'file-upload-input', message }))); }} /> : readOnlyDocuments(pageDocuments)}
            <details className="govuk-details govuk-!-margin-top-6" open>
              <summary className="govuk-details__summary"><span className="govuk-details__summary-text">{COPY[step].guidanceTitle}</span></summary>
              <div className="govuk-details__text">
                <ul className="govuk-list">{COPY[step].points.map((point) => <li className="govuk-!-margin-bottom-4" key={point}>{point}</li>)}</ul>
                {step === 'order' && (data.orderDetails.includesSpecialLand === false
                  ? <p className="govuk-body">Form 1 applies because the order does not include common land, open space or an allotment. Section 10(2) of the Acquisition of Land Act 1981 and regulation 3 of SI 2004/2595 set the form.</p>
                  : typeof data.orderDetails.includesSpecialLand === 'boolean'
                    ? <p className="govuk-body">Your order includes common land, open space or allotment. Check the prescribed form and the certificate requirements under section 19 of the Acquisition of Land Act 1981 before uploading.</p>
                    : <p className="govuk-body">Complete the common land question in <Link className="govuk-link" to={`${CPO_BASE_URL}/${applicationId}/order-details/special-land`}>Order details</Link> to establish which prescribed form applies.</p>)}
                {step === 'maps' && <><p className="govuk-body">A plan that only shows where the land is counts as an additional document.</p><p className="govuk-body">If the order and maps do not clearly identify the land, the Secretary of State can refuse to confirm it.</p></>}
                {step === 'reasons' && <p className="govuk-body">Paragraph 239.1 of the compulsory purchase guidance has the full list.</p>}
                {step === 'additional' && <><p className="govuk-body">If the order affects common land, open space or allotments, apply for a certificate under section 19 of the Acquisition of Land Act 1981 when you submit.</p><p className="govuk-body">You do not need to upload the general certificate or the protected assets certificate. You confirm those when you submit.</p></>}
              </div>
            </details>
          </> : <>
            <dl className="govuk-summary-list">{(['order', 'maps', 'reasons', 'additional'] as UploadStep[]).map((target) => {
              const files = data.documents.filter((document) => document.category === DOCUMENT_CATEGORIES[target]);
              return <div className="govuk-summary-list__row" key={target}><dt className="govuk-summary-list__key">{SUMMARY_LABELS[target]}</dt>
                <dd className="govuk-summary-list__value">{files.length ? files.map((document) => <p className="govuk-!-margin-bottom-1" key={document.document_id}>{document.filename}</p>) : target === 'additional' ? 'None uploaded' : 'Not uploaded'}</dd>
                <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={`${base}/${target}?from=${fromApplicationReview ? 'application-review' : 'check'}`}>Change<span className="govuk-visually-hidden"> {SUMMARY_LABELS[target].toLowerCase()}</span></Link></dd>
              </div>;
            })}</dl>
            <div className={`govuk-form-group${errors.some((error) => error.id === 'documents-correct-yes') ? ' govuk-form-group--error' : ''}`}>
              <fieldset className="govuk-fieldset" aria-describedby={errors.some((error) => error.id === 'documents-correct-yes') ? 'documents-correct-error' : undefined}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Is everything in this section correct?</legend>
                {errors.some((error) => error.id === 'documents-correct-yes') && <p className="govuk-error-message" id="documents-correct-error"><span className="govuk-visually-hidden">Error:</span> {errors.find((error) => error.id === 'documents-correct-yes')?.message}</p>}
                <div className="govuk-radios govuk-radios--inline">{[true, false].map((answer) => <div className="govuk-radios__item" key={String(answer)}>
                  <input className="govuk-radios__input" id={`documents-correct-${answer ? 'yes' : 'no'}`} name="documents-correct" type="radio" value={answer ? 'yes' : 'no'} checked={confirmed === answer} onChange={() => { setConfirmed(answer); setErrors([]); }} />
                  <label className="govuk-label govuk-radios__label" htmlFor={`documents-correct-${answer ? 'yes' : 'no'}`}>{answer ? 'Yes' : 'No'}</label>
                </div>)}</div>
              </fieldset>
            </div>
          </>}
          <div className="govuk-button-group"><button className="govuk-button" type="submit">Save and continue</button><button className="govuk-button govuk-button--secondary" type="button" onClick={() => void save(true)}>Save for later</button></div>
        </fieldset>
      </form>
      {saving && <p className="govuk-body" role="status">Saving order documents...</p>}
    </div></div></div>
  </>;
};

export default CpoOrderDocumentsPage;