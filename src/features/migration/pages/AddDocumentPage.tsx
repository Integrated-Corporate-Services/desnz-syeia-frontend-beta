import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import FileUpload, { type FileUploadHandle } from '../../../components/FileUpload';
import PageTitle from '../../../components/PageTitle';
import BackLink from '../components/BackLink';
import { LoadingMessage, MigrationNotFound, ServiceProblem } from '../components/PageMessages';
import { withMigrationAdmin } from '../components/withMigrationAdmin';
import { MIGRATION_CONTENT, MIGRATION_ERRORS, MIGRATION_PATHS, migrationPaths } from '../constants';
import { useErrorSummaryFocus } from '../hooks/useErrorSummaryFocus';
import { resolveApplicationId, useMigratedApplication } from '../hooks/useMigratedApplication';
import { migrationUploadEndpoints } from '../services/migrationApi';
import type { FieldErrors, MigratedApplicationLocationState } from '../types';
import { documentTypeKey } from '../utils/documents';
import { getMigrationErrorMessage, isNotFoundError } from '../utils/errors';
import { pageTitle } from '../utils/format';

const CONTENT = MIGRATION_CONTENT.ADD_DOCUMENT;
const TYPE_FIELD_ID = 'document-type';
/** The id FileUpload gives its file input. */
const FILE_FIELD_ID = 'file-upload-input';

export const AddDocumentPage: React.FC = () => {
  const { migratedApplicationId = '' } = useParams<{ migratedApplicationId: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useMigratedApplication(migratedApplicationId);
  const uploadRef = useRef<FileUploadHandle>(null);
  const submittingRef = useRef(false);
  const [selectedType, setSelectedType] = useState('');
  const [typeError, setTypeError] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const errors: FieldErrors = [
    ...(typeError ? [{ fieldId: TYPE_FIELD_ID, message: typeError }] : []),
    ...fileErrors.map((message) => ({ fieldId: FILE_FIELD_ID, message })),
  ];
  const errorSummaryRef = useErrorSummaryFocus(errors.length, attempt);

  if (loading && !data) return <LoadingMessage />;
  if (error && isNotFoundError(error)) {
    return (
      <MigrationNotFound
        heading={MIGRATION_ERRORS.APPLICATION_NOT_FOUND}
        body={MIGRATION_CONTENT.APPLICATION.NOT_FOUND_BODY}
        linkTo={MIGRATION_PATHS.OPERATIONAL_TASKS}
        linkText={MIGRATION_CONTENT.APPLICATION.FIND_ANOTHER}
      />
    );
  }
  if (error || !data) return <ServiceProblem message={getMigrationErrorMessage(error)} />;

  const applicationId = resolveApplicationId(data, migratedApplicationId);
  const documentTypes = data.documentTypes ?? [];
  const selected = documentTypes.find((type) => documentTypeKey(type.category, type.subCategory) === selectedType);
  const applicationPath = migrationPaths.application(migratedApplicationId);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setAttempt((current) => current + 1);
    const nextTypeError = selected ? null : MIGRATION_ERRORS.DOCUMENT_TYPE_REQUIRED;
    const hasFile = (uploadRef.current?.getPendingFiles().length ?? 0) > 0;
    setTypeError(nextTypeError);
    setFileErrors(hasFile ? [] : [MIGRATION_ERRORS.DOCUMENT_FILE_REQUIRED]);
    if (nextTypeError || !hasFile || !uploadRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const result = await uploadRef.current.triggerUpload();
      const notClean = result.uploadedFiles.some((file) => file.scanResult !== 'CLEAN');
      if (result.scanErrors.length > 0 || result.uploadedFiles.length === 0 || notClean) {
        const fallback = notClean ? MIGRATION_ERRORS.VIRUS_CHECK_NOT_CLEAN : MIGRATION_ERRORS.SERVICE;
        setFileErrors(result.scanErrors.length > 0 ? result.scanErrors : [fallback]);
        setAttempt((current) => current + 1);
        return;
      }
      const state: MigratedApplicationLocationState = { success: MIGRATION_CONTENT.SUCCESS.DOCUMENT_ADDED };
      navigate(applicationPath, { state });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageTitle title={pageTitle(CONTENT.TITLE, errors.length > 0)} />
      <BackLink to={applicationPath} />
      <div className="govuk-grid-row govuk-!-padding-top-4">
        <div className="govuk-grid-column-two-thirds">
          <ErrorSummary ref={errorSummaryRef} errors={errors} />
          <span className="govuk-caption-l">{migratedApplicationId}</span>
          <h1 className="govuk-heading-l">{CONTENT.TITLE}</h1>
          <form onSubmit={submit} noValidate>
            <div className={`govuk-form-group${typeError ? ' govuk-form-group--error' : ''}`}>
              <label className="govuk-label govuk-label--m" htmlFor={TYPE_FIELD_ID}>
                {CONTENT.TYPE_LABEL}
              </label>
              <div className="govuk-hint" id={`${TYPE_FIELD_ID}-hint`}>
                {CONTENT.TYPE_HINT}
              </div>
              {typeError && (
                <p className="govuk-error-message" id={`${TYPE_FIELD_ID}-error`}>
                  <span className="govuk-visually-hidden">Error:</span> {typeError}
                </p>
              )}
              <select
                className={`govuk-select${typeError ? ' govuk-select--error' : ''}`}
                id={TYPE_FIELD_ID}
                name="documentType"
                aria-describedby={`${TYPE_FIELD_ID}-hint${typeError ? ` ${TYPE_FIELD_ID}-error` : ''}`}
                value={selectedType}
                disabled={submitting}
                onChange={(event) => setSelectedType(event.target.value)}
              >
                <option value="">{CONTENT.TYPE_PLACEHOLDER}</option>
                {documentTypes.map((type) => {
                  const key = documentTypeKey(type.category, type.subCategory);
                  return (
                    <option value={key} key={key}>
                      {type.label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className={`govuk-form-group${fileErrors.length > 0 ? ' govuk-form-group--error' : ''}`}>
              <h2 className="govuk-label-wrapper">
                <label className="govuk-label govuk-label--m" htmlFor={FILE_FIELD_ID}>
                  {CONTENT.FILE_LABEL}
                </label>
              </h2>
              {fileErrors.map((message) => (
                <p className="govuk-error-message" key={message}>
                  <span className="govuk-visually-hidden">Error:</span> {message}
                </p>
              ))}
              <FileUpload
                ref={uploadRef}
                maxFiles={1}
                showTitle={false}
                hasExternalLabel
                applicationId={applicationId}
                category={selected?.category}
                subCategory={selected?.subCategory ?? undefined}
                prefix={selected ? `${applicationId}/${selected.category}` : applicationId}
                uploadEndpoints={migrationUploadEndpoints(applicationId)}
                onValidationErrors={setFileErrors}
              />
            </div>

            <button className="govuk-button" type="submit" data-module="govuk-button" disabled={submitting} aria-disabled={submitting}>
              {submitting ? CONTENT.UPLOADING : CONTENT.SUBMIT}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

const AddDocumentRoute = withMigrationAdmin(AddDocumentPage);
export default AddDocumentRoute;
