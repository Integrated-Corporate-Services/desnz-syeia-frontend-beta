import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import FileUpload, { type FileUploadHandle } from '../../../../components/FileUpload';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { cpoOrderDocumentsService } from '../services/cpoOrderDocumentsService';
import { DOCUMENT_CATEGORIES, DOCUMENT_GROUP_CATEGORIES, DOCUMENT_STEPS } from '../constants/orderDocumentsConstants';
import type { CpoDocument, DocumentStep, OrderDocumentsResponse, UploadStep } from '../types/orderDocuments';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';
import '../../styles/cpo.css';
import { ALLOWED_FILE_EXTENSIONS } from '../../../../utils/fileValidationConstants';

const COPY: Record<UploadStep, { heading: string; description: string; uploadTitle: string; hint: string; guidanceTitle: string; points: string[] }> = {
  order: {
    heading: 'Upload the order documents', description: 'The order documents include:',
    uploadTitle: 'Upload an order document', hint: 'Upload them as separate files.', guidanceTitle: 'Order and map requirements',
    points: ['the digitally certified order', 'all digitally certified order maps'],
  },
  maps: {
    heading: 'Upload the order maps', description: 'The order maps show which land the order affects. They form part of the order, so they must be sealed and dated on the same day.',
    uploadTitle: 'Upload the sealed order maps and an unsealed copy', hint: 'Upload each sheet as a separate file. If there is more than one sheet, include a key plan showing how they fit together.', guidanceTitle: 'What the maps must show',
    points: ['Ordnance Survey mapping at 1:1250 or better, 1:2500 in rural areas, 1:500 in densely built-up areas', 'every plot numbered to match the schedule', 'land to be acquired, land for new rights and exchange land shown differently: by convention pink, blue and green', 'a heading matching paragraph 2 of the order'],
  },
  reasons: {
    heading: 'Upload the statement of reasons and related documents', description: 'Related documents include all documents referred to in the statement of reasons.',
    uploadTitle: 'Upload the statement of reasons and related documents', hint: '', guidanceTitle: 'What to cover',
    points: ['the order land: where it is and how it is used now', 'the power you are using: section 10 of and Schedule 3 to the Electricity Act 1989', 'why compulsory powers are justified in the public interest', 'your human rights and Public Sector Equality Duty assessment', 'the planning position, funding and any consent the scheme still needs', 'what you have done to buy the land or rights by agreement', 'any related application that needs a coordinated decision'],
  },
  additional: {
    heading: 'Upload any additional documents (optional)', description: 'You can upload any additional documents such as:', uploadTitle: 'Upload an additional document (optional)',
    hint: '', guidanceTitle: 'Examples of additional documents',
    points: ['a general certificate', 'a protected assets certificate and any related documents', 'additional information you believe is relevant to this application'],
  },
};
const SUMMARY_LABELS: Record<UploadStep, string> = { order: 'The order documents', maps: 'The order maps', reasons: 'Statement of reasons and related documents', additional: 'Additional documents (optional)' };
type DocumentError = { id: string; message: string };

const CpoOrderDocumentsPage: React.FC = () => {
  const { documentStep = 'order' } = useParams();
  const applicationId = useCpoApplicationId();
  const step: (typeof DOCUMENT_STEPS)[number] = DOCUMENT_STEPS.includes(documentStep as (typeof DOCUMENT_STEPS)[number]) ? documentStep as (typeof DOCUMENT_STEPS)[number] : 'order';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromApplicationReview = searchParams.get('from') === 'application-review';
  const fromCheck = searchParams.get('from') === 'check' || fromApplicationReview;
  const [data, setData] = useState<OrderDocumentsResponse>({ orderDetails: {}, documents: [] });
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<DocumentError[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const uploadRef = useRef<FileUploadHandle>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const base = `${CPO_BASE_URL}/${applicationId}/order-documents`;
  const heading = step === 'check' ? 'Check order documents' : COPY[step].heading;
  const editable = data.canEdit !== false;
  const category = step === 'check' ? '' : DOCUMENT_CATEGORIES[step];
  const pageDocuments = data.documents.filter(document => step !== 'check' && DOCUMENT_GROUP_CATEGORIES[step].includes(document.category));
  const backUrl = fromCheck && step !== 'check' ? `${base}/check${fromApplicationReview ? '?from=application-review' : ''}`
    : step === 'order' ? `${CPO_BASE_URL}/${applicationId}/task-list` : `${base}/${DOCUMENT_STEPS[DOCUMENT_STEPS.indexOf(step) - 1]}${fromApplicationReview ? '?from=application-review' : ''}`;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setErrors([]);
    setFileErrors([]);
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
    if (fileErrors.length) { setErrors(fileErrors.map((message) => ({ id: 'file-upload-input', message }))); return; }
    if (uploadRef.current?.isBusy()) { setErrors([{ id: 'file-upload-input', message: 'Wait for uploads and virus checks to finish before continuing' }]); return; }
    setSaving(true);
    setErrors([]);
    try {
      if (uploadRef.current) {
        const result = await uploadRef.current.triggerUpload();
        if (result.scanErrors.length) { setErrors(result.scanErrors.map((message) => ({ id: 'file-upload-input', message }))); return; }
      }
      const result = await cpoOrderDocumentsService.save(applicationId, step, saveForLater, step === 'check' ? !saveForLater : null);
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
    <div className="govuk-width-container cpo-order-details cpo-document-uploads">
    <Link className="govuk-back-link govuk-!-margin-bottom-6" to={backUrl}>Back</Link>
    <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {errors.length > 0 && <div className="govuk-error-summary" ref={errorSummary} tabIndex={-1} role="alert" aria-labelledby="documents-error-title">
        <h2 className="govuk-error-summary__title" id="documents-error-title">There is a problem</h2>
        <div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list">{errors.map((error, index) => <li key={`${error.id}-${index}`}><a href={`#${error.id}`}>{error.message}</a></li>)}</ul></div>
      </div>}
      <span className="govuk-caption-l">Order documents</span>
      <h1 className="govuk-heading-l" id="documents-heading" tabIndex={-1} ref={headingRef}>{heading}</h1>
      {loading && <p className="govuk-body" role="status">Loading order documents...</p>}
      {!loading && !editable && <p className="govuk-body" role="status">You can view these documents but cannot change them.</p>}
      <form onSubmit={(event) => { event.preventDefault(); void save(false); }}>
        <fieldset className="govuk-fieldset" disabled={loading || loadFailed || saving || !editable}>
          <legend className="govuk-visually-hidden">{heading}</legend>
          {step !== 'check' ? <>
            <p className="govuk-body" id="documents-hint">{COPY[step].description}</p>
            {(step === 'order' || step === 'additional') && <ul className="govuk-list govuk-list--bullet">{COPY[step].points.map(point => <li key={point}>{point}</li>)}</ul>}
            {step === 'order' && <div className="govuk-inset-text">If your file is larger than 25MB and cannot be uploaded, please contact our team at <a className="govuk-link" href="mailto:compulsorypurchaseorders@energysecurity.gov.uk">compulsorypurchaseorders@energysecurity.gov.uk</a> to arrange another way to send the file. Remember to include this application's DESNZ reference number in your email.</div>}
            {errors.filter((error) => error.id === 'file-upload-input').map((error, index) => <p className="govuk-error-message" id={`documents-upload-error-${index}`} key={index}><span className="govuk-visually-hidden">Error:</span> {error.message}</p>)}
            {editable ? <FileUpload key={step} ref={uploadRef} visibleDocumentsHeading canDelete={!loading && !saving && !loadFailed} title={COPY[step].uploadTitle} titleHeadingLevel="h2" category={category} subCategory={step.toUpperCase()} applicationId={applicationId} prefix={`${applicationId}/${category}`} acceptedTypes={ALLOWED_FILE_EXTENSIONS.join(',')}
              uploadImmediately
              hint={`You can upload ${ALLOWED_FILE_EXTENSIONS.join(', ')} files of up to 25MB each. Files cannot be password protected. ${COPY[step].hint}`}
              inputDescribedBy={['documents-hint', ...errors.filter((error) => error.id === 'file-upload-input').map((_error, index) => `documents-upload-error-${index}`)].join(' ')}
              uploadedFiles={pageDocuments.map((document) => ({ id: document.file_id, storageProvider: document.storage_provider, s3Key: document.s3_key, bucketName: document.bucket_name, virtualFolder: document.virtual_folder, filename: document.filename, fileContentType: document.file_content_type, fileSizeBytes: document.file_size_bytes, uploadedAtTimestamp: document.uploaded_at_timestamp, scanStatus: document.scan_status, scanResult: document.scan_result }))}
              applicationDocuments={pageDocuments.map((document) => ({ documentId: document.document_id, applicationId, fileId: document.file_id, category, subCategory: step.toUpperCase(), addedBy: document.added_by, addedAt: document.added_at }))}
              onUploaded={refreshDocuments} onDeleteFile={(id) => setData((current) => ({ ...current, documents: current.documents.filter((document) => document.file_id !== id) }))}
              onValidationErrors={(messages) => { setFileErrors(messages); setErrors(messages.map((message) => ({ id: 'file-upload-input', message }))); }} /> : readOnlyDocuments(pageDocuments)}
            {step === 'order' && typeof data.orderDetails.includesSpecialLand === 'boolean' && <details className="govuk-details govuk-!-margin-top-6">
              <summary className="govuk-details__summary"><span className="govuk-details__summary-text">{COPY[step].guidanceTitle}</span></summary>
              <div className="govuk-details__text">
                {step === 'order' && (data.orderDetails.includesSpecialLand === false
                  ? <p className="govuk-body">Form 1 applies because the order does not include common land, open space or an allotment. Section 10(2) of the Acquisition of Land Act 1981 and regulation 3 of SI 2004/2595 set the form.</p>
                  : <p className="govuk-body">Your order includes common land, open space or allotment. Check the prescribed form and the certificate requirements under section 19 of the Acquisition of Land Act 1981 before uploading.</p>)}
                  {step === 'order' && data.orderDetails.includesSpecialLand === true && typeof data.orderDetails.exchangeLand !== 'boolean' && <p className="govuk-body">Complete the <Link className="govuk-link" to={`${CPO_BASE_URL}/${applicationId}/order-details/exchange-land?from=order-documents${fromApplicationReview ? '&return=application-review' : ''}`}>exchange land question</Link> before continuing.</p>}
              </div>
            </details>}
          </> : <>
            <dl className="govuk-summary-list">{(['order', 'reasons', 'additional'] as const).map((target) => {
              const files = data.documents.filter(document => DOCUMENT_GROUP_CATEGORIES[target].includes(document.category));
              return <div className="govuk-summary-list__row" key={target}><dt className="govuk-summary-list__key">{SUMMARY_LABELS[target]}</dt>
                <dd className="govuk-summary-list__value" style={{ overflowWrap: 'anywhere' }}>{files.length ? readOnlyDocuments(files) : target === 'additional' ? 'None uploaded' : 'Not uploaded'}</dd>
                <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={`${base}/${target}?from=${fromApplicationReview ? 'application-review' : 'check'}`}>Change<span className="govuk-visually-hidden"> {SUMMARY_LABELS[target].toLowerCase()}</span></Link></dd>
              </div>;
            })}</dl>
          </>}
          <div className="govuk-button-group"><button className="govuk-button" type="submit">Save and continue</button><button className="govuk-button govuk-button--secondary" type="button" onClick={() => void save(true)}>Save for later</button></div>
        </fieldset>
      </form>
      {saving && <p className="govuk-body" role="status">Saving order documents...</p>}
    </div></div></div>
  </>;
};

export default CpoOrderDocumentsPage;