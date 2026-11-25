import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import PaginationComponent from '../../admin/components/PaginationComponent';
import BackLink from '../components/BackLink';
import MigrationStatusTag from '../components/MigrationStatusTag';
import { LoadingMessage } from '../components/PageMessages';
import { withMigrationAdmin } from '../components/withMigrationAdmin';
import { BATCHES_PAGE_SIZE, MIGRATION_CONTENT, MIGRATION_PATHS, migrationPaths } from '../constants';
import { listBatches } from '../services/migrationApi';
import type { MigrationBatchListResponse } from '../types';
import { getMigrationErrorMessage } from '../utils/errors';
import { formatCount, formatDateTime } from '../utils/format';

const CONTENT = MIGRATION_CONTENT.BATCHES;

const parsePage = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const BatchesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const [data, setData] = useState<MigrationBatchListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listBatches(page, BATCHES_PAGE_SIZE)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((loadError) => {
        if (!cancelled) setError(getMigrationErrorMessage(loadError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const batches = data?.batches ?? [];
  const pageSize = data?.pageSize || BATCHES_PAGE_SIZE;
  const totalPages = data ? Math.max(1, Math.ceil((data.total ?? batches.length) / pageSize)) : 1;

  return (
    <>
      <PageTitle title={CONTENT.TITLE} />
      <BackLink to={MIGRATION_PATHS.OPERATIONAL_TASKS} />
      <div className="govuk-grid-row govuk-!-padding-top-4">
        <div className="govuk-grid-column-full">
          <span className="govuk-caption-l">{MIGRATION_CONTENT.CAPTION}</span>
          <h1 className="govuk-heading-l">{CONTENT.TITLE}</h1>
          <Link className="govuk-button govuk-button--secondary" to={MIGRATION_PATHS.NEW_BATCH} role="button" draggable={false}>
            {CONTENT.START_LINK}
          </Link>

          {loading && <LoadingMessage />}

          {!loading && error && (
            <div className="govuk-error-summary" role="alert" aria-labelledby="batches-error-title" tabIndex={-1}>
              <h2 className="govuk-error-summary__title" id="batches-error-title">
                There is a problem
              </h2>
              <div className="govuk-error-summary__body">
                <p className="govuk-body">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && batches.length === 0 && <p className="govuk-body">{CONTENT.EMPTY}</p>}

          {!loading && !error && batches.length > 0 && (
            <>
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">{CONTENT.TITLE}</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">{CONTENT.HEADERS.BATCH_ID}</th>
                    <th scope="col" className="govuk-table__header">{CONTENT.HEADERS.STATUS}</th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">{CONTENT.HEADERS.EXPECTED}</th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">{CONTENT.HEADERS.LOADED}</th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">{CONTENT.HEADERS.FAILED}</th>
                    <th scope="col" className="govuk-table__header">{CONTENT.HEADERS.STARTED}</th>
                    <th scope="col" className="govuk-table__header">{CONTENT.HEADERS.UPDATED}</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {batches.map((batch) => (
                    <tr className="govuk-table__row" key={batch.batchId}>
                      <th scope="row" className="govuk-table__header">
                        <Link className="govuk-link" to={migrationPaths.batch(batch.batchId)}>
                          {batch.batchId}
                        </Link>
                      </th>
                      <td className="govuk-table__cell">
                        <MigrationStatusTag kind="batch" status={batch.status} />
                      </td>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatCount(batch.expectedCaseCount)}</td>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatCount(batch.loadedCaseCount)}</td>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatCount(batch.failedCaseCount)}</td>
                      <td className="govuk-table__cell">{formatDateTime(batch.createdAt)}</td>
                      <td className="govuk-table__cell">{formatDateTime(batch.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <PaginationComponent
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(next) => setSearchParams({ page: String(next) })}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default withMigrationAdmin(BatchesPage);
