import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import { MIGRATION_CONTENT, MIGRATION_PATHS, migrationPaths } from '../constants';
import { useErrorSummaryFocus } from '../hooks/useErrorSummaryFocus';
import { validateReference } from '../utils/validation';

const FIELD_ID = 'migrated-application-reference';

/** Content of the "Migration" sub-tab in Operational tasks. */
const MigrationTasksPanel: React.FC = () => {
  const navigate = useNavigate();
  const [reference, setReference] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const errorSummaryRef = useErrorSummaryFocus(error ? 1 : 0, attempt);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateReference(reference);
    setAttempt((value) => value + 1);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    navigate(migrationPaths.application(reference.trim()));
  };

  return (
    <div className="migration-tasks">
      <ErrorSummary ref={errorSummaryRef} errors={error ? [{ fieldId: FIELD_ID, message: error }] : []} />
      <h2 className="govuk-heading-l">{MIGRATION_CONTENT.SUB_TAB.HEADING}</h2>
      <p className="govuk-body">{MIGRATION_CONTENT.SUB_TAB.INTRO}</p>
      <ul className="govuk-list">
        <li>
          <Link className="govuk-link" to={MIGRATION_PATHS.NEW_BATCH}>
            {MIGRATION_CONTENT.SUB_TAB.START}
          </Link>
        </li>
        <li>
          <Link className="govuk-link" to={MIGRATION_PATHS.BATCHES}>
            {MIGRATION_CONTENT.SUB_TAB.VIEW}
          </Link>
        </li>
      </ul>

      <h3 className="govuk-heading-m">{MIGRATION_CONTENT.FIND.HEADING}</h3>
      <form onSubmit={submit} noValidate>
        <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
          <label className="govuk-label" htmlFor={FIELD_ID}>
            {MIGRATION_CONTENT.FIND.LABEL}
          </label>
          <div className="govuk-hint" id={`${FIELD_ID}-hint`}>
            {MIGRATION_CONTENT.FIND.HINT}
          </div>
          {error && (
            <p className="govuk-error-message" id={`${FIELD_ID}-error`}>
              <span className="govuk-visually-hidden">Error:</span> {error}
            </p>
          )}
          <input
            className={`govuk-input govuk-input--width-30${error ? ' govuk-input--error' : ''}`}
            id={FIELD_ID}
            name="reference"
            type="text"
            autoComplete="off"
            spellCheck={false}
            aria-describedby={`${FIELD_ID}-hint${error ? ` ${FIELD_ID}-error` : ''}`}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
        </div>
        <button className="govuk-button" type="submit" data-module="govuk-button">
          {MIGRATION_CONTENT.FIND.SUBMIT}
        </button>
      </form>
    </div>
  );
};

export default MigrationTasksPanel;
