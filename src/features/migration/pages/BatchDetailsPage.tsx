import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import BackLink from '../components/BackLink';
import MigrationStatusTag from '../components/MigrationStatusTag';
import { LoadingMessage, MigrationNotFound, ServiceProblem } from '../components/PageMessages';
import { withMigrationAdmin } from '../components/withMigrationAdmin';
import { MIGRATION_CONTENT, MIGRATION_ERRORS, MIGRATION_PATHS, migrationPaths } from '../constants';
import { getBatch } from '../services/migrationApi';
import type { MigrationBatchDetails } from '../types';
import { getMigrationErrorMessage, isNotFoundError } from '../utils/errors';
import { formatCount, formatDateTime } from '../utils/format';

const CONTENT = MIGRATION_CONTENT.BATCH_DETAILS;
const FAILED_BATCH_STATUSES = ['VALIDATION_FAILED', 'APPLICANT_LOAD_FAILED', 'SALESFORCE_LOAD_FAILED'];

export const BatchDetailsPage: React.FC = () => {
  const { batchId = '' } = useParams<{ batchId: string }>();
  const [batch, setBatch] = useState<MigrationBatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBatch(await getBatch(batchId));
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !batch) return <LoadingMessage />;
  if (error && isNotFoundError(error)) {
    return (
      <MigrationNotFound
        heading={MIGRATION_ERRORS.BATCH_NOT_FOUND}
        linkTo={MIGRATION_PATHS.BATCHES}
        linkText={MIGRATION_CONTENT.CONFIRMATION.VIEW_BATCHES}
      />
    );
  }
  if (error || !batch) return <ServiceProblem message={getMigrationErrorMessage(error)} />;

  const cases = batch.cases ?? [];
  const hasFailed =
    FAILED_BATCH_STATUSES.includes((batch.status || '').toUpperCase()) ||
    (batch.preflightStatus || '').toUpperCase() === 'PREFLIGHT_FAILED' ||
    Boolean(batch.failureReason);

  const row = (key: string, value: React.ReactNode) => (
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{key}</dt>
      <dd className="govuk-summary-list__value">{value}</dd>
    </div>
  );

  return (
    <>
      <PageTitle title={CONTENT.TITLE(batch.batchId || batchId)} />
      <BackLink to={MIGRATION_PATHS.BATCHES} />
      <div className="govuk-grid-row govuk-!-padding-top-4">
        <div className="govuk-grid-column-full">
          <span className="govuk-caption-l">{MIGRATION_CONTENT.CAPTION}</span>
          <h1 className="govuk-heading-l">{CONTENT.TITLE(batch.batchId || batchId)}</h1>

          {hasFailed && (
            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">
                !
              </span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-visually-hidden">Warning</span>
                {CONTENT.FAILURE_HEADING}
              </strong>
            </div>
          )}
          {hasFailed && (batch.failureReason || batch.failureCode) && (
            <div className="govuk-inset-text">
              {batch.failureReason && <p className="govuk-body">{batch.failureReason}</p>}
              {batch.failureCode && <p className="govuk-body govuk-hint">{`Failure code: ${batch.failureCode}`}</p>}
            </div>
          )}

          <dl className="govuk-summary-list">
            {row(CONTENT.STATUS, <MigrationStatusTag kind="batch" status={batch.status} />)}
            {row(CONTENT.PREFLIGHT_STATUS, <MigrationStatusTag kind="preflight" status={batch.preflightStatus} />)}
            {row(CONTENT.EXPECTED, formatCount(batch.expectedCaseCount))}
            {batch.validatedCaseCount !== undefined && row(CONTENT.VALIDATED, formatCount(batch.validatedCaseCount))}
            {row(CONTENT.LOADED, formatCount(batch.loadedCaseCount))}
            {row(CONTENT.FAILED, formatCount(batch.failedCaseCount))}
            {row(CONTENT.STARTED, formatDateTime(batch.createdAt))}
            {row(CONTENT.UPDATED, formatDateTime(batch.updatedAt))}
            {batch.completedAt && row(CONTENT.COMPLETED, formatDateTime(batch.completedAt))}
          </dl>

          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
            onClick={() => void load()}
            disabled={loading}
            aria-disabled={loading}
          >
            {CONTENT.REFRESH}
          </button>
          <div role="status" aria-live="polite" className="govuk-visually-hidden">
            {loading ? MIGRATION_CONTENT.LOADING : ''}
          </div>

          <h2 className="govuk-heading-m">{CONTENT.CASES_HEADING}</h2>
          {cases.length === 0 ? (
            <p className="govuk-body">{CONTENT.NO_CASES}</p>
          ) : (
            <div className="migration-table-scroll" style={{ overflowX: 'auto' }}>
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">{CONTENT.CASES_HEADING}</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    {Object.values(CONTENT.HEADERS).map((header) => (
                      <th scope="col" className="govuk-table__header" key={header}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {cases.map((migrationCase) => {
                    const reference = migrationCase.desnzRef || migrationCase.applicationId;
                    return (
                      <tr className="govuk-table__row" key={migrationCase.legacyCaseId}>
                        <th scope="row" className="govuk-table__header">{migrationCase.legacyCaseId}</th>
                        <td className="govuk-table__cell">
                          {reference ? (
                            <Link className="govuk-link" to={migrationPaths.application(reference)}>
                              {migrationCase.desnzRef || MIGRATION_CONTENT.NOT_AVAILABLE}
                            </Link>
                          ) : (
                            MIGRATION_CONTENT.NOT_AVAILABLE
                          )}
                        </td>
                        <td className="govuk-table__cell">{migrationCase.applicationId || MIGRATION_CONTENT.NOT_AVAILABLE}</td>
                        <td className="govuk-table__cell">
                          <MigrationStatusTag kind="validation" status={migrationCase.validationStatus} />
                        </td>
                        <td className="govuk-table__cell">
                          <MigrationStatusTag kind="awsLoad" status={migrationCase.awsLoadStatus} />
                        </td>
                        <td className="govuk-table__cell">
                          <MigrationStatusTag kind="salesforceLoad" status={migrationCase.salesforceLoadStatus} />
                        </td>
                        <td className="govuk-table__cell">
                          <MigrationStatusTag kind="documentRecord" status={migrationCase.documentRecordStatus} />
                        </td>
                        <td className="govuk-table__cell">{migrationCase.failureReason || ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const BatchDetailsRoute = withMigrationAdmin(BatchDetailsPage);
export default BatchDetailsRoute;
