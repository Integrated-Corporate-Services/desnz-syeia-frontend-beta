import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import type { FileUploadHandle } from '../../../../components/FileUpload';
import ExecutiveSummaryUpload from '../components/ExecutiveSummaryUpload';
import { EXECUTIVE_SUMMARY_COPY } from '../constants/executiveSummaryConstants';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';
import { useExecutiveSummary } from '../hooks/useExecutiveSummary';
import { cpoExecutiveSummaryService } from '../services/cpoExecutiveSummaryService';
import type { ExecutiveSummaryFormError } from '../types/executiveSummary';
import { getExecutiveSummaryExitUrl } from '../utils/executiveSummaryNavigation';
import '../../styles/cpo.css';

const CpoExecutiveSummaryPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exitUrl = getExecutiveSummaryExitUrl(applicationId, searchParams.get('from') === 'application-review');
  const { documents, setDocuments, canEdit, loading, loadFailed, loadError, refreshDocuments } = useExecutiveSummary(applicationId);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ExecutiveSummaryFormError[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const errorSummary = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const uploadRef = useRef<FileUploadHandle>(null);
  const { heading, caption, hint } = EXECUTIVE_SUMMARY_COPY;

  useEffect(() => {
    if (loadError) setErrors([{ id: 'executive-summary-heading', message: loadError }]);
  }, [loadError]);

  useEffect(() => {
    if (errors.length) errorSummary.current?.focus();
  }, [errors]);

  useEffect(() => {
    if (!loading && !loadFailed) headingRef.current?.focus();
  }, [loading, loadFailed]);

  const toUploadErrors = (messages: string[]) => messages.map((message) => ({ id: 'file-upload-input', message }));

  const save = async (saveForLater: boolean) => {
    if (loading || saving || loadFailed || !canEdit) return;
    if (uploadErrors.length) { setErrors(toUploadErrors(uploadErrors)); return; }
    if (uploadRef.current?.isBusy()) { setErrors(toUploadErrors(['Wait for your files to finish uploading and being checked for viruses'])); return; }
    setSaving(true);
    setErrors([]);
    try {
      if (uploadRef.current) {
        const uploaded = await uploadRef.current.triggerUpload();
        if (uploaded.scanErrors.length) { setErrors(toUploadErrors(uploaded.scanErrors)); return; }
      }
      const result = await cpoExecutiveSummaryService.save(applicationId, saveForLater);
      setDocuments(result.documents);
      navigate(saveForLater ? '/application-dashboard' : exitUrl);
    } catch (error) {
      setErrors(toUploadErrors([error instanceof Error ? error.message : 'Unable to save the executive summary. Try again.']));
    } finally { setSaving(false); }
  };

  const uploadError = errors.find((error) => error.id === 'file-upload-input');

  return <>
    <PageTitle title={`${errors.length ? 'Error: ' : ''}${heading}`} />
    <div className="govuk-width-container cpo-order-details cpo-executive-summary">
      <Link className="govuk-back-link govuk-!-margin-bottom-6" to={exitUrl}>Back</Link>
      <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
        {errors.length > 0 && <div className="govuk-error-summary" role="alert" tabIndex={-1} ref={errorSummary} aria-labelledby="executive-summary-error-title">
          <h2 className="govuk-error-summary__title" id="executive-summary-error-title">There is a problem</h2>
          <div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list">{errors.map((error, index) => <li key={`${error.id}-${index}`}><a href={`#${error.id}`}>{error.message}</a></li>)}</ul></div>
        </div>}
        <span className="govuk-caption-l">{caption}</span>
        <h1 className="govuk-heading-l" id="executive-summary-heading" ref={headingRef} tabIndex={-1}>{heading}</h1>
        <div id="executive-summary-hint" className="govuk-body">{hint}</div>
        {loading && <p className="govuk-body" role="status">Loading executive summary...</p>}
        {!loading && !canEdit && <p className="govuk-body" role="status">You can view this executive summary but cannot change it.</p>}
        <form onSubmit={(event) => { event.preventDefault(); void save(false); }}>
          <fieldset className="govuk-fieldset" disabled={loading || saving || loadFailed || !canEdit}>
            <legend className="govuk-visually-hidden">{heading}</legend>
            <a className="govuk-button govuk-button--secondary govuk-!-margin-bottom-6" href={cpoExecutiveSummaryService.templateUrl(applicationId)}>Download executive summary template</a>
            {uploadError && <p className="govuk-error-message" id="file-upload-input-error"><span className="govuk-visually-hidden">Error:</span> {uploadError.message}</p>}
            <ExecutiveSummaryUpload
              ref={uploadRef}
              applicationId={applicationId}
              documents={documents}
              onValidationErrors={(messages) => { setUploadErrors(messages); setErrors(toUploadErrors(messages)); }}
              onDeleteFile={(id) => setDocuments((current) => current.filter((document) => document.file_id !== id))}
              onUploaded={() => { void refreshDocuments().catch(() => setErrors(toUploadErrors(['Unable to refresh uploaded documents. Refresh the page.']))); }}
            />
            <div className="govuk-button-group govuk-!-margin-top-6"><button className="govuk-button" type="submit">Save and continue</button><button className="govuk-button govuk-button--secondary" type="button" onClick={() => void save(true)}>Save for later</button></div>
          </fieldset>
        </form>
        {saving && <p className="govuk-body" role="status">Saving executive summary...</p>}
      </div></div>
    </div>
  </>;
};

export default CpoExecutiveSummaryPage;
