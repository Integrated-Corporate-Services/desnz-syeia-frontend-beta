import React, { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import PageTitle from '../../../components/PageTitle';
import BackLink from '../components/BackLink';
import { withMigrationAdmin } from '../components/withMigrationAdmin';
import { MIGRATION_CONTENT, MIGRATION_PATHS } from '../constants';
import { useErrorSummaryFocus } from '../hooks/useErrorSummaryFocus';
import { useNewBatchWizard } from '../hooks/useNewBatchWizard';
import { uploadCasesFile } from '../services/migrationApi';
import { getMigrationErrorMessage, isMigrationApiError } from '../utils/errors';
import { pageTitle } from '../utils/format';
import { validateCasesFile } from '../utils/validation';

const FIELD_ID = 'cases-file';
const CONTENT = MIGRATION_CONTENT.FILE;

export const CasesFilePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, setUpload } = useNewBatchWizard();
  const [file, setFile] = useState<File | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submittingRef = useRef(false);

  const errors = [
    ...(fieldError ? [{ fieldId: FIELD_ID, message: fieldError }] : []),
    ...(generalError ? [{ fieldId: 'general', message: generalError }] : []),
  ];
  const errorSummaryRef = useErrorSummaryFocus(errors.length, attempt);

  if (!state.batchId) return <Navigate to={MIGRATION_PATHS.NEW_BATCH} replace />;
  const batchId = state.batchId;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setAttempt((current) => current + 1);
    setGeneralError(null);
    const validationError = validateCasesFile(file);
    if (validationError || !file) {
      setFieldError(validationError);
      return;
    }
    setFieldError(null);
    submittingRef.current = true;
    setUploading(true);
    try {
      const result = await uploadCasesFile(batchId, file);
      setUpload(result);
      navigate(MIGRATION_PATHS.NEW_BATCH_CHECK);
    } catch (error) {
      const message = getMigrationErrorMessage(error);
      // 400 is a problem with the file itself, so it belongs to the field.
      if (isMigrationApiError(error) && error.status === 400) setFieldError(message);
      else setGeneralError(message);
    } finally {
      submittingRef.current = false;
      setUploading(false);
    }
  };

  return (
    <>
      <PageTitle title={pageTitle(CONTENT.TITLE, errors.length > 0)} />
      <BackLink to={MIGRATION_PATHS.NEW_BATCH} />
      <div className="govuk-grid-row govuk-!-padding-top-4">
        <div className="govuk-grid-column-two-thirds">
          <ErrorSummary ref={errorSummaryRef} errors={errors} />
          <span className="govuk-caption-l">{`${MIGRATION_CONTENT.CAPTION}: ${batchId}`}</span>
          <h1 className="govuk-heading-l">{CONTENT.TITLE}</h1>
          <form onSubmit={submit} noValidate>
            <div className={`govuk-form-group${fieldError ? ' govuk-form-group--error' : ''}`}>
              <label className="govuk-label govuk-label--m" htmlFor={FIELD_ID}>
                {CONTENT.LABEL}
              </label>
              <div className="govuk-hint" id={`${FIELD_ID}-hint`}>
                {CONTENT.HINT}
              </div>
              {fieldError && (
                <p className="govuk-error-message" id={`${FIELD_ID}-error`}>
                  <span className="govuk-visually-hidden">Error:</span> {fieldError}
                </p>
              )}
              <input
                className={`govuk-file-upload${fieldError ? ' govuk-file-upload--error' : ''}`}
                id={FIELD_ID}
                name="casesFile"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                aria-describedby={`${FIELD_ID}-hint${fieldError ? ` ${FIELD_ID}-error` : ''}`}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <div role="status" aria-live="polite">
              {uploading && <p className="govuk-body govuk-!-font-weight-bold">{CONTENT.UPLOADING}</p>}
            </div>
            <button className="govuk-button" type="submit" data-module="govuk-button" disabled={uploading} aria-disabled={uploading}>
              {CONTENT.CONTINUE}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default withMigrationAdmin(CasesFilePage);
