import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { withMigrationAdmin } from '../components/withMigrationAdmin';
import { MIGRATION_CONTENT, MIGRATION_PATHS, migrationPaths } from '../constants';
import { readLastStartedBatch } from '../utils/wizardStorage';

const CONTENT = MIGRATION_CONTENT.CONFIRMATION;

export const BatchConfirmationPage: React.FC = () => {
  const location = useLocation();
  const routerBatchId = (location.state as { batchId?: string } | null)?.batchId;
  // sessionStorage keeps the panel on refresh.
  const batchId = routerBatchId || readLastStartedBatch();

  if (!batchId) return <Navigate to={MIGRATION_PATHS.BATCHES} replace />;

  return (
    <div className="govuk-grid-row govuk-!-padding-top-4">
      <PageTitle title={CONTENT.TITLE} />
      <div className="govuk-grid-column-two-thirds">
        <div className="govuk-panel govuk-panel--confirmation">
          <h1 className="govuk-panel__title">{CONTENT.TITLE}</h1>
          <div className="govuk-panel__body">{CONTENT.PANEL_BODY(batchId)}</div>
        </div>
        <h2 className="govuk-heading-m">{CONTENT.NEXT_HEADING}</h2>
        {CONTENT.NEXT_BODY.map((paragraph) => (
          <p className="govuk-body" key={paragraph}>
            {paragraph}
          </p>
        ))}
        <p className="govuk-body">
          <Link className="govuk-link" to={migrationPaths.batch(batchId)}>
            {CONTENT.VIEW_BATCH}
          </Link>
        </p>
        <p className="govuk-body">
          <Link className="govuk-link" to={MIGRATION_PATHS.BATCHES}>
            {CONTENT.VIEW_BATCHES}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default withMigrationAdmin(BatchConfirmationPage);
