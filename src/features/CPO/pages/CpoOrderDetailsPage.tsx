import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import FileUpload, { type FileUploadHandle } from '../../../components/FileUpload';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { CPO_BASE_URL } from '../../../constants/cpo';
import { cpoOrderDetailsService, nextOrderStep } from '../services/cpoOrderDetailsService';
import { EMPTY_ORDER_DETAILS, EXECUTIVE_SUMMARY_CATEGORY, ORDER_STEPS, RELATED_TYPE_LABELS } from '../constants/orderDetailsConstants';
import type { OrderDetails, OrderDocument, OrderStep, RelatedApplication, RelatedType } from '../types/orderDetails';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';

type FormError = { id: string; message: string };
const COPY: Record<OrderStep, { heading: string; hint?: string }> = {
  name: { heading: 'What is the name of the order?', hint: 'For example, National Grid Electricity Distribution (North Ridge) Compulsory Purchase Order 2026.' },
  purpose: { heading: 'What is the order for?', hint: 'Describe what you will use the land or rights for, and why the order is needed.' },
  'special-land': { heading: 'Does the order include common land, open space, or a fuel or field garden allotment?', hint: 'This decides which prescribed form your order must use, and whether you need a certificate under section 19 of the Acquisition of Land Act 1981.' },
  'exchange-land': { heading: 'Are you providing land in exchange?', hint: 'Exchange land is land given in place of the common land, open space or allotment being acquired.' },
  'executive-summary': { heading: 'Executive summary', hint: 'Download the template, fill it in, then upload it. The executive summary explains what the order does and why it is needed.' },
  'related-applications': { heading: 'Are there any other applications related to this one?', hint: 'For example, a development consent order, a Section 37 consent, or another compulsory purchase order for this project.' },
  'add-related-application': { heading: 'Add a related application' },
  'related-applications-list': { heading: 'Related applications' },
  check: { heading: 'Check order details' },
};
const emptyRelated = (): RelatedApplication => ({ id: crypto.randomUUID(), type: '', otherType: '', reference: '', siteAddress: '', relationship: '' });

const CpoOrderDetailsPage: React.FC = () => {
  const { orderStep = 'name' } = useParams();
  const applicationId = useCpoApplicationId();
  const step: OrderStep = ORDER_STEPS.includes(orderStep as OrderStep) ? orderStep as OrderStep : 'name';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromApplicationReview = searchParams.get('from') === 'application-review';
  const fromCheck = searchParams.get('from') === 'check' || fromApplicationReview;
  const editId = searchParams.get('edit');
  const [details, setDetails] = useState<OrderDetails>(EMPTY_ORDER_DETAILS);
  const [documents, setDocuments] = useState<OrderDocument[]>([]);
  const [related, setRelated] = useState<RelatedApplication>(emptyRelated);
  const [addAnother, setAddAnother] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [errors, setErrors] = useState<FormError[]>([]);
  const errorSummary = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const uploadRef = useRef<FileUploadHandle>(null);
  const base = `${CPO_BASE_URL}/${applicationId}/order-details`;
  const heading = step === 'related-applications-list'
    ? `You have added ${details.relatedApplications.length} related application${details.relatedApplications.length === 1 ? '' : 's'}`
    : COPY[step].heading;

  useBreadcrumb(
    <div className="govuk-breadcrumbs"><ol className="govuk-breadcrumbs__list">
      <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={`${CPO_BASE_URL}/${applicationId}/task-list`}>Task list</Link></li>
      <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={base}>Order details</Link></li>
    </ol></div>
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setErrors([]);
    setAddAnother(null);
    setCorrect(null);
    cpoOrderDetailsService.get(applicationId).then((result) => {
      if (!active) return;
      setDetails(result.details);
      setDocuments(result.documents);
      setCanEdit(result.canEdit !== false);
      const entry = editId ? result.details.relatedApplications.find((item) => item.id === editId) : undefined;
      if (editId && !entry) throw new Error('Related application not found. Return to the related applications list.');
      setRelated(entry || emptyRelated());
    }).catch((error) => {
      if (!active) return;
      setLoadFailed(true);
      setErrors([{ id: 'order-heading', message: error instanceof Error ? error.message : 'Unable to load order details. Refresh the page.' }]);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId, step, editId]);

  useEffect(() => {
    if (errors.length) errorSummary.current?.focus();
  }, [errors]);

  useEffect(() => {
    if (!loading) {
      if (loadFailed) errorSummary.current?.focus();
      else headingRef.current?.focus();
    }
  }, [loading, step, loadFailed]);

  const update = (changes: Partial<OrderDetails>) => setDetails((current) => ({ ...current, ...changes }));
  const errorFor = (id: string) => errors.find((error) => error.id === id)?.message;
  const inlineError = (id: string) => errorFor(id) && <p className="govuk-error-message" id={`${id}-error`}><span className="govuk-visually-hidden">Error:</span> {errorFor(id)}</p>;
  const changeUrl = (target: OrderStep) => `${base}/${target}?from=${fromApplicationReview ? 'application-review' : 'check'}`;

  const choices = (id: string, value: boolean | null, onChange: (answer: boolean) => void, title: string, visibleLegend = false) => (
    <div className={`govuk-form-group${errorFor(`${id}-yes`) ? ' govuk-form-group--error' : ''}`}>
      <fieldset className="govuk-fieldset" aria-describedby={`order-hint${errorFor(`${id}-yes`) ? ` ${id}-yes-error` : ''}`}>
        <legend className={visibleLegend ? 'govuk-fieldset__legend govuk-fieldset__legend--s' : 'govuk-visually-hidden'}>{title}</legend>
        {inlineError(`${id}-yes`)}
        <div className={`govuk-radios${visibleLegend ? ' govuk-radios--inline' : ''}`}>
          {[true, false].map((answer) => <div className="govuk-radios__item" key={String(answer)}>
            <input className="govuk-radios__input" id={`${id}-${answer ? 'yes' : 'no'}`} name={id} type="radio" value={answer ? 'yes' : 'no'} checked={value === answer} onChange={() => { onChange(answer); setErrors([]); }} />
            <label className="govuk-label govuk-radios__label" htmlFor={`${id}-${answer ? 'yes' : 'no'}`}>{answer ? 'Yes' : 'No'}</label>
          </div>)}
        </div>
      </fieldset>
    </div>
  );

  const inputField = (id: keyof RelatedApplication, label: string, hint: string | undefined, maxLength: number) => (
    <div className={`govuk-form-group${errorFor(id) ? ' govuk-form-group--error' : ''}`}>
      <label className="govuk-label" htmlFor={id}>{label}</label>
      {hint && <div className="govuk-hint" id={`${id}-hint`}>{hint}</div>}
      {inlineError(id)}
      <input className={`govuk-input${errorFor(id) ? ' govuk-input--error' : ''}`} id={id} value={related[id]} maxLength={maxLength} onChange={(event) => setRelated((current) => ({ ...current, [id]: event.target.value }))} aria-describedby={[hint ? `${id}-hint` : '', errorFor(id) ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined} />
    </div>
  );

  const validate = (): FormError[] => {
    if (step === 'name' && !details.orderName.trim()) return [{ id: 'orderName', message: 'Enter the name of the order' }];
    if (step === 'purpose' && (!details.purpose.trim() || details.purpose.length > 4000)) return [{ id: 'purpose', message: details.purpose.length > 4000 ? 'What the order is for must be 4,000 characters or fewer' : 'Enter what the order is for' }];
    if (step === 'special-land' && details.includesSpecialLand === null) return [{ id: 'special-land-yes', message: 'Select yes or no for common land, open space or allotment' }];
    if (step === 'exchange-land' && details.exchangeLand === null) return [{ id: 'exchange-land-yes', message: 'Select yes or no for exchange land' }];
    if (step === 'related-applications' && details.hasRelatedApplications === null) return [{ id: 'related-applications-yes', message: 'Select yes or no for related applications' }];
    if (step === 'related-applications-list' && addAnother === null) return [{ id: 'add-another-yes', message: 'Select yes or no to add another related application' }];
    if (step === 'related-applications-list' && addAnother === false && !details.relatedApplications.length) return [{ id: 'add-another-yes', message: 'Add a related application or change your related applications answer to no' }];
    if (step === 'check' && correct !== true) return [{ id: 'correct-yes', message: correct === false ? 'Use the Change links to correct your answers, then select yes' : 'Select yes if everything in this section is correct' }];
    if (step === 'add-related-application') {
      const result: FormError[] = [];
      if (!related.type) result.push({ id: 'related-type-DCO', message: 'Select the type of related application' });
      if (related.type === 'OTHER' && !related.otherType.trim()) result.push({ id: 'otherType', message: 'Enter the type of application' });
      if (!related.relationship.trim()) result.push({ id: 'relationship', message: 'Enter how it is related to this order' });
      return result;
    }
    return [];
  };

  const save = async (saveForLater: boolean) => {
    if (loading || saving || loadFailed || !canEdit) return;
    const validationErrors = saveForLater ? [] : validate();
    if (validationErrors.length) { setErrors(validationErrors); return; }
    if (uploadRef.current?.isBusy()) { setErrors([{ id: 'file-upload-input', message: 'Wait for your files to finish uploading and being checked for viruses' }]); return; }
    setSaving(true);
    setErrors([]);
    try {
      const changes: Partial<OrderDetails> = {};
      let savedStep: string = step;
      if (step === 'name') changes.orderName = details.orderName.trim();
      if (step === 'purpose') changes.purpose = details.purpose.trim();
      if (step === 'special-land') changes.includesSpecialLand = details.includesSpecialLand;
      if (step === 'exchange-land') changes.exchangeLand = details.exchangeLand;
      if (step === 'related-applications') changes.hasRelatedApplications = details.hasRelatedApplications;
      if (step === 'related-applications-list') changes.relatedApplications = details.relatedApplications;
      if (step === 'related-applications-list' && addAnother === true && !details.relatedApplications.length) {
        savedStep = 'related-applications';
        delete changes.relatedApplications;
        changes.hasRelatedApplications = true;
      }
      if (step === 'add-related-application') {
        const entry = { ...related, otherType: related.type === 'OTHER' ? related.otherType.trim() : '', reference: related.reference.trim(), siteAddress: related.siteAddress.trim(), relationship: related.relationship.trim() };
        changes.relatedApplications = editId ? details.relatedApplications.map((item) => item.id === editId ? entry : item) : [...details.relatedApplications, entry];
        savedStep = 'related-applications-list';
      }
      if (step === 'executive-summary' && uploadRef.current) {
        const uploaded = await uploadRef.current.triggerUpload();
        if (uploaded.scanErrors.length) { setErrors(uploaded.scanErrors.map((message) => ({ id: 'file-upload-input', message }))); return; }
      }
      const result = await cpoOrderDetailsService.save(applicationId, savedStep, changes, saveForLater);
      setDetails(result.details);
      setDocuments(result.documents);
      if (saveForLater) { navigate('/application-dashboard'); return; }
      let next = nextOrderStep(step, result.details, addAnother);
      if (fromCheck && !['related-applications', 'add-related-application', 'related-applications-list', 'check'].includes(step)) {
        next = step === 'special-land' && result.details.includesSpecialLand && result.details.exchangeLand === null ? 'exchange-land' : 'check';
      }
      const returnQuery = fromApplicationReview ? '?from=application-review' : fromCheck && next !== 'check' ? '?from=check' : '';
      navigate(next ? `${base}/${next}${returnQuery}` : `${CPO_BASE_URL}/${applicationId}/${fromApplicationReview ? 'check-and-submit' : 'task-list'}`);
    } catch (error) {
      setErrors([{ id: step === 'executive-summary' ? 'file-upload-input' : 'order-heading', message: error instanceof Error ? error.message : 'Unable to save order details. Try again.' }]);
    } finally { setSaving(false); }
  };

  const summaryRow = (label: string, value: React.ReactNode, target: OrderStep) => <div className="govuk-summary-list__row" key={label}>
    <dt className="govuk-summary-list__key">{label}</dt><dd className="govuk-summary-list__value">{value}</dd>
    <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={changeUrl(target)}>Change<span className="govuk-visually-hidden"> {label.toLowerCase()}</span></Link></dd>
  </div>;
  const choiceText = (value: boolean | null) => value === null ? 'Not answered' : value ? 'Yes' : 'No';

  return <>
    <PageTitle title={`${errors.length ? 'Error: ' : ''}${heading}`} />
    <div className="govuk-width-container cpo-order-details"><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {errors.length > 0 && <div className="govuk-error-summary" role="alert" tabIndex={-1} ref={errorSummary} aria-labelledby="order-error-title">
        <h2 className="govuk-error-summary__title" id="order-error-title">There is a problem</h2>
        <div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list">{errors.map((error, index) => <li key={`${error.id}-${index}`}><a href={`#${error.id}`}>{error.message}</a></li>)}</ul></div>
      </div>}
      {step === 'add-related-application' && <span className="govuk-caption-l">Related applications</span>}
      <h1 className="govuk-heading-l" id="order-heading" ref={headingRef} tabIndex={-1}>{heading}</h1>
      <div id="order-hint" className={COPY[step].hint ? 'govuk-hint' : 'govuk-visually-hidden'}>{COPY[step].hint || heading}</div>
      {loading && <p className="govuk-body" role="status">Loading order details...</p>}
      {!loading && !canEdit && <p className="govuk-body" role="status">You can view these order details but cannot change them.</p>}
      <form onSubmit={(event) => { event.preventDefault(); void save(false); }}>
        <fieldset className="govuk-fieldset" disabled={loading || saving || loadFailed || !canEdit}>
          <legend className="govuk-visually-hidden">{heading}</legend>
          {(step === 'name' || step === 'purpose') && <div className={`govuk-form-group${errorFor(step === 'name' ? 'orderName' : 'purpose') ? ' govuk-form-group--error' : ''}`}>
            <label className="govuk-label govuk-visually-hidden" htmlFor={step === 'name' ? 'orderName' : 'purpose'}>{heading}</label>
            {inlineError(step === 'name' ? 'orderName' : 'purpose')}
            {step === 'name' ? <input className={`govuk-input${errorFor('orderName') ? ' govuk-input--error' : ''}`} id="orderName" value={details.orderName} maxLength={500} onChange={(event) => update({ orderName: event.target.value })} aria-describedby={`order-hint${errorFor('orderName') ? ' orderName-error' : ''}`} />
              : <><textarea className={`govuk-textarea${errorFor('purpose') ? ' govuk-textarea--error' : ''}`} id="purpose" rows={3} maxLength={4000} value={details.purpose} onChange={(event) => update({ purpose: event.target.value })} aria-describedby={`order-hint purpose-limit${errorFor('purpose') ? ' purpose-error' : ''}`} /><div className="govuk-hint" id="purpose-limit">You can enter up to 4,000 characters</div></>}
          </div>}
          {step === 'special-land' && choices('special-land', details.includesSpecialLand, (value) => update({ includesSpecialLand: value }), heading)}
          {step === 'exchange-land' && choices('exchange-land', details.exchangeLand, (value) => update({ exchangeLand: value }), heading)}
          {step === 'related-applications' && choices('related-applications', details.hasRelatedApplications, (value) => update({ hasRelatedApplications: value }), heading)}
          {step === 'executive-summary' && <>
            <a className="govuk-button govuk-button--secondary govuk-!-margin-bottom-6" href={cpoOrderDetailsService.templateUrl(applicationId)}>Download executive summary template</a>
            {inlineError('file-upload-input')}
            <FileUpload ref={uploadRef} title="Upload your executive summary" applicationId={applicationId} category={EXECUTIVE_SUMMARY_CATEGORY} subCategory="EXECUTIVE_SUMMARY" prefix={`${applicationId}/${EXECUTIVE_SUMMARY_CATEGORY}`}
              hint="You can upload .pdf, .jpg, .jpeg, .png, .docx and .xlsx files of up to 25MB each. You can add more than one file. Files cannot be password protected."
              acceptedTypes=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
              uploadedFiles={documents.map((document) => ({ id: document.file_id, storageProvider: document.storage_provider, s3Key: document.s3_key, bucketName: document.bucket_name, virtualFolder: document.virtual_folder, filename: document.filename, fileContentType: document.file_content_type, fileSizeBytes: document.file_size_bytes, uploadedAtTimestamp: document.uploaded_at_timestamp, scanStatus: document.scan_status, scanResult: document.scan_result }))}
              applicationDocuments={documents.map((document) => ({ documentId: document.document_id, applicationId, fileId: document.file_id, category: EXECUTIVE_SUMMARY_CATEGORY, subCategory: 'EXECUTIVE_SUMMARY', addedBy: document.added_by, addedAt: document.added_at }))}
              onValidationErrors={(messages) => setErrors(messages.map((message) => ({ id: 'file-upload-input', message })))}
              onDeleteFile={(id) => setDocuments((current) => current.filter((document) => document.file_id !== id))}
              onUploaded={() => { void cpoOrderDetailsService.get(applicationId).then((result) => setDocuments(result.documents)).catch(() => setErrors([{ id: 'file-upload-input', message: 'Unable to refresh uploaded documents. Refresh the page.' }])); }} />
          </>}
          {step === 'add-related-application' && <>
            <div className={`govuk-form-group${errorFor('related-type-DCO') ? ' govuk-form-group--error' : ''}`}>
              <fieldset className="govuk-fieldset" aria-describedby={`related-type-hint${errorFor('related-type-DCO') ? ' related-type-DCO-error' : ''}`}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">What type of application is it?</legend>
                <div className="govuk-hint" id="related-type-hint">Choose the option that best describes the application you are linking to.</div>
                {inlineError('related-type-DCO')}
                <div className="govuk-radios">{(['DCO', 'S37', 'CPO', 'OTHER'] as RelatedType[]).map((type) => <React.Fragment key={type}>
                  <div className="govuk-radios__item"><input className="govuk-radios__input" id={`related-type-${type}`} name="related-type" type="radio" checked={related.type === type} onChange={() => setRelated((current) => ({ ...current, type }))} aria-controls={type === 'OTHER' ? 'other-application-type' : undefined} aria-expanded={type === 'OTHER' ? related.type === 'OTHER' : undefined} /><label className="govuk-label govuk-radios__label" htmlFor={`related-type-${type}`}>{RELATED_TYPE_LABELS[type]}</label></div>
                  {type === 'OTHER' && related.type === 'OTHER' && <div className="govuk-radios__conditional" id="other-application-type">{inputField('otherType', 'Type of application', undefined, 200)}</div>}
                </React.Fragment>)}</div>
              </fieldset>
            </div>
            {inputField('reference', 'Reference number (optional)', 'For example, EN010145 or S37-2026-0188. Leave this blank if a reference has not been issued yet.', 200)}
            {inputField('siteAddress', 'Site address (optional)', 'The address or location of the land the other application covers.', 1000)}
            {inputField('relationship', 'How is it related to this order?', 'For example, the same project, or a scheme that depends on this one.', 1000)}
          </>}
          {step === 'related-applications-list' && <>
            <dl className="govuk-summary-list">{details.relatedApplications.map((entry) => <div className="govuk-summary-list__row" key={entry.id}>
              <dt className="govuk-summary-list__key">{entry.type === 'OTHER' ? entry.otherType || 'Other' : RELATED_TYPE_LABELS[entry.type]}</dt>
              <dd className="govuk-summary-list__value">{[entry.reference, entry.siteAddress, entry.relationship].filter(Boolean).join(' - ') || 'Not answered'}</dd>
              <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={`${base}/add-related-application?edit=${entry.id}${fromCheck ? `&from=${fromApplicationReview ? 'application-review' : 'check'}` : ''}`}>Change<span className="govuk-visually-hidden"> related application {entry.reference || entry.type}</span></Link></dd>
            </div>)}</dl>
            {choices('add-another', addAnother, setAddAnother, 'Do you need to add another related application?', true)}
          </>}
          {step === 'check' && <>
            <dl className="govuk-summary-list">
              {summaryRow('Name of the order', details.orderName || 'Not answered', 'name')}
              {summaryRow('What the order is for', details.purpose || 'Not answered', 'purpose')}
              {summaryRow('Common land, open space or allotment', choiceText(details.includesSpecialLand), 'special-land')}
              {details.includesSpecialLand && summaryRow('Land in exchange', choiceText(details.exchangeLand), 'exchange-land')}
              {summaryRow('Executive summary', documents.length ? documents.map((document) => <p className="govuk-!-margin-bottom-1" key={document.document_id}>{document.filename}</p>) : 'Not uploaded', 'executive-summary')}
              {summaryRow('Related applications', details.hasRelatedApplications ? `Yes. ${details.relatedApplications.length} added: ${details.relatedApplications.map((entry) => entry.reference || RELATED_TYPE_LABELS[entry.type]).join(', ')}` : choiceText(details.hasRelatedApplications), 'related-applications')}
            </dl>
            {choices('correct', correct, setCorrect, 'Is everything in this section correct?', true)}
          </>}
          <div className="govuk-button-group govuk-!-margin-top-6"><button className="govuk-button" type="submit">Save and continue</button><button className="govuk-button govuk-button--secondary" type="button" onClick={() => void save(true)}>Save for later</button></div>
        </fieldset>
      </form>
      {saving && <p className="govuk-body" role="status">Saving order details...</p>}
    </div></div></div>
  </>;
};

export default CpoOrderDetailsPage;