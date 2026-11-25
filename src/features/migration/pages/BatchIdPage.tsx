import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import PageTitle from '../../../components/PageTitle';
import BackLink from '../components/BackLink';
import { withMigrationAdmin } from '../components/withMigrationAdmin';
import { MIGRATION_CONTENT, MIGRATION_ERRORS, MIGRATION_PATHS } from '../constants';
import { useErrorSummaryFocus } from '../hooks/useErrorSummaryFocus';
import { useNewBatchWizard } from '../hooks/useNewBatchWizard';
import { checkBatchId } from '../services/migrationApi';
import { getMigrationErrorMessage, isMigrationApiError } from '../utils/errors';
import { pageTitle } from '../utils/format';
import { validateBatchId } from '../utils/validation';

const FIELD_ID = 'batch-id';
const CONTENT = MIGRATION_CONTENT.BATCH_ID;

export const BatchIdPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, setBatchId } = useNewBatchWizard();
  const [value, setValue] = useState(state.batchId ?? '');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submittingRef = useRef(false);

  const errors = [
    ...(fieldError ? [{ fieldId: FIELD_ID, message: fieldError }] : []),
    ...(generalError ? [{ fieldId: 'general', message: generalError }] : []),
  ];
  const errorSummaryRef = useErrorSummaryFocus(errors.length, attempt);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setAttempt((current) => current + 1);
    setGeneralError(null);
    const batchId = value.trim();
    const validationError = validateBatchId(batchId);
    if (validationError) {
      setFieldError(validationError);
      return;
    }
    setFieldError(null);
    submittingRef.current = true;
    setChecking(true);
    try {
      const result = await checkBatchId(batchId);
      if (!result?.available) {
        setFieldError(MIGRATION_ERRORS.BATCH_ID_TAKEN);
        return;
      }
      setBatchId(batchId);
      navigate(MIGRATION_PATHS.NEW_BATCH_FILE);
    } catch (error) {
      const message = getMigrationErrorMessage(error, { 409: MIGRATION_ERRORS.BATCH_ID_TAKEN });
      if (isMigrationApiError(error) && (error.status === 400 || error.status === 409)) setFieldError(message);
      else setGeneralError(message);
    } finally {
      submittingRef.current = false;
      setChecking(false);
    }
  };

  return (
    <>
      <PageTitle title={pageTitle(CONTENT.TITLE, errors.length > 0)} />
      <BackLink to={MIGRATION_PATHS.OPERATIONAL_TASKS} />
      <div className="govuk-!-padding-top-4">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary ref={errorSummaryRef} errors={errors} />
            <form onSubmit={submit} noValidate>
              <div className={`govuk-form-group${fieldError ? ' govuk-form-group--error' : ''}`}>
                <h1 className="govuk-label-wrapper">
                  <span className="govuk-caption-l">{MIGRATION_CONTENT.CAPTION}</span>
                  <label className="govuk-label govuk-label--l" htmlFor={FIELD_ID}>
                    {CONTENT.TITLE}
                  </label>
                </h1>
                <div className="govuk-hint" id={`${FIELD_ID}-hint`}>
                  {CONTENT.HINT}
                </div>
                {fieldError && (
                  <p className="govuk-error-message" id={`${FIELD_ID}-error`}>
                    <span className="govuk-visually-hidden">Error:</span> {fieldError}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-20${fieldError ? ' govuk-input--error' : ''}`}
                  id={FIELD_ID}
                  name="batchId"
                  type="text"
                  spellCheck={false}
                  autoComplete="off"
                  aria-describedby={`${FIELD_ID}-hint${fieldError ? ` ${FIELD_ID}-error` : ''}`}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              </div>
              <button className="govuk-button" type="submit" data-module="govuk-button" disabled={checking} aria-disabled={checking}>
                {CONTENT.CONTINUE}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const BatchIdRoute = withMigrationAdmin(BatchIdPage);
export default BatchIdRoute;
