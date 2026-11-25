import React, { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import PageTitle from '../../../components/PageTitle';
import BackLink from '../components/BackLink';
import { withMigrationAdmin } from '../components/withMigrationAdmin';
import { CASE_IDS_INLINE_LIMIT, MIGRATION_CONTENT, MIGRATION_ERRORS, MIGRATION_PATHS } from '../constants';
import { useErrorSummaryFocus } from '../hooks/useErrorSummaryFocus';
import { useNewBatchWizard } from '../hooks/useNewBatchWizard';
import { startBatch } from '../services/migrationApi';
import { getMigrationErrorMessage } from '../utils/errors';
import { formatFileSize, normaliseWarning, pageTitle } from '../utils/format';
import { writeLastStartedBatch, writeWizardState } from '../utils/wizardStorage';

const CONTENT = MIGRATION_CONTENT.CHECK;

const CaseIdList: React.FC<{ caseIds: string[] }> = ({ caseIds }) => {
  const list = (
    <ul className="govuk-list">
      {caseIds.map((caseId) => (
        <li key={caseId}>{caseId}</li>
      ))}
    </ul>
  );
  if (caseIds.length <= CASE_IDS_INLINE_LIMIT) return list;
  return (
    <details className="govuk-details govuk-!-margin-bottom-0" data-module="govuk-details">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">{CONTENT.SHOW_CASE_IDS(caseIds.length)}</span>
      </summary>
      <div className="govuk-details__text">{list}</div>
    </details>
  );
};

export const CheckBatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useNewBatchWizard();
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submittingRef = useRef(false);
  const errors = error ? [{ fieldId: 'general', message: error }] : [];
  const errorSummaryRef = useErrorSummaryFocus(errors.length, attempt);

  if (!state.batchId) return <Navigate to={MIGRATION_PATHS.NEW_BATCH} replace />;
  if (!state.upload) return <Navigate to={MIGRATION_PATHS.NEW_BATCH_FILE} replace />;
  const { batchId, upload } = state;
  const warnings = (upload.warnings ?? []).map(normaliseWarning);
  const caseIds = upload.caseIds ?? [];

  const start = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // A ref, not state, so a fast double click cannot send two requests.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStarting(true);
    setError(null);
    try {
      const result = await startBatch(batchId, upload.uploadId);
      const startedBatchId = result.batchId || batchId;
      writeLastStartedBatch(startedBatchId);
      // Clear storage only: clearing component state would re-render this page without a batch.
      writeWizardState(null);
      navigate(MIGRATION_PATHS.NEW_BATCH_CONFIRMATION, { replace: true, state: { batchId: startedBatchId } });
    } catch (startError) {
      setError(getMigrationErrorMessage(startError, { 409: MIGRATION_ERRORS.START_CONFLICT }));
      setAttempt((current) => current + 1);
      submittingRef.current = false;
      setStarting(false);
    }
  };

  const row = (key: string, value: React.ReactNode, changeTo?: string, changeLabel?: string) => (
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{key}</dt>
      <dd className="govuk-summary-list__value">{value}</dd>
      {changeTo ? (
        <dd className="govuk-summary-list__actions">
          <Link className="govuk-link" to={changeTo}>
            {CONTENT.CHANGE}
            <span className="govuk-visually-hidden"> {changeLabel}</span>
          </Link>
        </dd>
      ) : (
        <dd className="govuk-summary-list__actions" />
      )}
    </div>
  );

  return (
    <>
      <PageTitle title={pageTitle(CONTENT.TITLE, errors.length > 0)} />
      <BackLink to={MIGRATION_PATHS.NEW_BATCH_FILE} />
      <div className="govuk-grid-row govuk-!-padding-top-4">
        <div className="govuk-grid-column-two-thirds">
          <ErrorSummary ref={errorSummaryRef} errors={errors} />
          <span className="govuk-caption-l">{MIGRATION_CONTENT.CAPTION}</span>
          <h1 className="govuk-heading-l">{CONTENT.TITLE}</h1>

          <dl className="govuk-summary-list govuk-!-margin-bottom-9">
            {row(CONTENT.BATCH_ID, batchId, MIGRATION_PATHS.NEW_BATCH, 'batch ID')}
            {row(CONTENT.FILE, upload.fileName, MIGRATION_PATHS.NEW_BATCH_FILE, 'cases file')}
            {row(CONTENT.SIZE, formatFileSize(upload.sizeBytes))}
            {row(CONTENT.CASE_COUNT, String(upload.caseCount))}
            {row(CONTENT.CASE_IDS, <CaseIdList caseIds={caseIds} />)}
          </dl>

          {warnings.length > 0 && (
            <div className="govuk-inset-text">
              <h2 className="govuk-heading-s">{CONTENT.WARNINGS_TITLE}</h2>
              <ul className="govuk-list govuk-list--bullet">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning</span>
              {CONTENT.CANNOT_UNDO}
            </strong>
          </div>

          <form onSubmit={start} noValidate>
            <div role="status" aria-live="polite" className="govuk-visually-hidden">
              {starting ? CONTENT.STARTING : ''}
            </div>
            <button
              className="govuk-button"
              type="submit"
              data-module="govuk-button"
              data-prevent-double-click="true"
              disabled={starting}
              aria-disabled={starting}
            >
              {starting ? CONTENT.STARTING : CONTENT.START}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default withMigrationAdmin(CheckBatchPage);
