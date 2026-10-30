import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import FileUpload, { type FileUploadHandle } from '../../../../components/FileUpload';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { cpoOrderDocumentsService } from '../services/cpoOrderDocumentsService';
import { DOCUMENT_CATEGORIES, DOCUMENT_GROUP_CATEGORIES, DOCUMENT_STEPS, ORDER_DOCUMENTS_COPY as COPY, ORDER_DOCUMENTS_SUMMARY_LABELS as SUMMARY_LABELS } from '../constants/orderDocumentsConstants';
import type { CpoDocument, DocumentStep, OrderDocumentsResponse, UploadStep } from '../types/orderDocuments';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';
import { useBreadcrumb } from '../../../../context/BreadcrumbContext';
import '../../styles/cpo.css';

type DocumentError = { id: string; message: string };

const CpoOrderDocumentsAdditionalPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  let step: (typeof DOCUMENT_STEPS)[number] = 'additional' as any;
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
  const editable = true;
  const category = step === 'check' ? '' : DOCUMENT_CATEGORIES[step];
  const pageDocuments = data.documents.filter(document => step !== 'check' && DOCUMENT_GROUP_CATEGORIES[step].includes(document.category));
  const backUrl = fromCheck && step !== 'check' ? `${base}/check${fromApplicationReview ? '?from=application-review' : ''}`
    : step === 'order' ? `${CPO_BASE_URL}/${applicationId}/task-list` : `${base}/${DOCUMENT_STEPS[DOCUMENT_STEPS.indexOf(step) - 1]}${fromApplicationReview ? '?from=application-review' : ''}`;
  useBreadcrumb(<Link className="govuk-back-link" to={backUrl}>Back</Link>);

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
      setData((current) => result);
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
            {COPY[step].hint && <p className="govuk-hint">{COPY[step].hint}</p>}
            {(step === 'order' || step === 'additional') && <ul className="govuk-list govuk-list--bullet">{COPY[step].points.map(point => <li key={point}>{point}</li>)}</ul>}
            {step === 'order' && <div className="govuk-inset-text">If your file is larger than 25MB and cannot be uploaded, please contact our team at <a className="govuk-link" href="mailto:compulsorypurchaseorders@energysecurity.gov.uk">compulsorypurchaseorders@energysecurity.gov.uk</a> to arrange another way to send the file. Remember to include this application's DESNZ reference number in your email.</div>}
            {errors.filter((error) => error.id === 'file-upload-input').map((error, index) => <p className="govuk-error-message" id={`documents-upload-error-${index}`} key={index}><span className="govuk-visually-hidden">Error:</span> {error.message}</p>)}
            {editable ? <FileUpload key={step} ref={uploadRef} title={COPY[step].uploadTitle} titleHeadingLevel="h2" category={category} subCategory={step.toUpperCase()} applicationId={applicationId} prefix={`${applicationId}/${category}`}
              uploadImmediately
              uploadedFiles={pageDocuments.map((document) => ({ id: document.file_id, storageProvider: 'aws_s3', s3Key: document.s3_key, bucketName: '', virtualFolder: document.s3_key ? document.s3_key.split('/').slice(0, -1).join('/') : '', filename: document.filename, fileContentType: document.file_content_type, fileSizeBytes: document.file_size_bytes, uploadedAtTimestamp: document.uploaded_at_timestamp }))}
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
export default CpoOrderDocumentsAdditionalPage;
