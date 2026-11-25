import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import PageTitle from '../../../components/PageTitle';
import ApplicationDataSummary from '../components/ApplicationDataSummary';
import BackLink from '../components/BackLink';
import MigrationStatusTag, { ScanStatusTag } from '../components/MigrationStatusTag';
import { LoadingMessage, MigrationNotFound, ServiceProblem, SuccessBanner } from '../components/PageMessages';
import { withMigrationAdmin } from '../components/withMigrationAdmin';
import { MIGRATION_CONTENT, MIGRATION_ERRORS, MIGRATION_PATHS, migrationPaths } from '../constants';
import { resolveApplicationId, resolveDesnzRef, useMigratedApplication } from '../hooks/useMigratedApplication';
import { useErrorSummaryFocus } from '../hooks/useErrorSummaryFocus';
import { markDocumentsComplete, removeDocument } from '../services/migrationApi';
import type { MigratedApplicationLocationState, MigratedDocument } from '../types';
import { groupDocuments } from '../utils/documents';
import { getMigrationErrorMessage, isNotFoundError } from '../utils/errors';
import { formatDateTime, pageTitle } from '../utils/format';

const CONTENT = MIGRATION_CONTENT.APPLICATION;

export const MigratedApplicationPage: React.FC = () => {
  const { migratedApplicationId = '' } = useParams<{ migratedApplicationId: string }>();
  const location = useLocation();
  const { data, loading, error, reload } = useMigratedApplication(migratedApplicationId);
  const [success, setSuccess] = useState<string | null>(
    () => (location.state as MigratedApplicationLocationState | null)?.success ?? null
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [pendingRemoval, setPendingRemoval] = useState<MigratedDocument | null>(null);
  const [removing, setRemoving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const busyRef = useRef(false);
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const errors = actionError ? [{ fieldId: 'general', message: actionError }] : [];
  const errorSummaryRef = useErrorSummaryFocus(errors.length, attempt);

  useEffect(() => {
    if (pendingRemoval) confirmHeadingRef.current?.focus();
  }, [pendingRemoval]);

  if (loading && !data) return <LoadingMessage />;
  if (error && isNotFoundError(error)) {
    return (
      <MigrationNotFound
        heading={MIGRATION_ERRORS.APPLICATION_NOT_FOUND}
        body={CONTENT.NOT_FOUND_BODY}
        linkTo={MIGRATION_PATHS.OPERATIONAL_TASKS}
        linkText={CONTENT.FIND_ANOTHER}
      />
    );
  }
  if (error || !data) return <ServiceProblem message={getMigrationErrorMessage(error)} />;

  const applicationId = resolveApplicationId(data, migratedApplicationId);
  const desnzRef = resolveDesnzRef(data);
  const { migration } = data;
  const statuses = migration?.statuses ?? {};
  const documentsComplete = (statuses.documentRecord || '').toUpperCase() === 'WRITTEN';
  const groups = groupDocuments(data.documents ?? [], data.documentTypes ?? []);

  const runAction = async (action: () => Promise<unknown>, successMessage: string, setBusy: (busy: boolean) => void) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setActionError(null);
    setSuccess(null);
    try {
      await action();
      setSuccess(successMessage);
      setPendingRemoval(null);
      await reload();
    } catch (actionFailure) {
      setActionError(getMigrationErrorMessage(actionFailure));
      setAttempt((current) => current + 1);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const row = (key: string, value: React.ReactNode) => (
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{key}</dt>
      <dd className="govuk-summary-list__value">{value}</dd>
    </div>
  );

  const title = desnzRef ? `${CONTENT.TITLE} ${desnzRef}` : CONTENT.TITLE;

  return (
    <>
      <PageTitle title={pageTitle(title, errors.length > 0)} />
      <BackLink to={migration?.batchId ? migrationPaths.batch(migration.batchId) : MIGRATION_PATHS.OPERATIONAL_TASKS} />
      <div className="govuk-grid-row govuk-!-padding-top-4">
        <div className="govuk-grid-column-full">
          <ErrorSummary ref={errorSummaryRef} errors={errors} />
          {success && <SuccessBanner message={success} />}

          {pendingRemoval && (
            <div className="govuk-!-margin-bottom-8" role="region" aria-labelledby="remove-document-heading">
              <h2 className="govuk-heading-m" id="remove-document-heading" ref={confirmHeadingRef} tabIndex={-1}>
                {CONTENT.REMOVE_CONFIRM_TITLE(pendingRemoval.fileName)}
              </h2>
              <p className="govuk-body">{CONTENT.REMOVE_CONFIRM_BODY}</p>
              <div className="govuk-button-group">
                <button
                  type="button"
                  className="govuk-button govuk-button--warning"
                  data-module="govuk-button"
                  disabled={removing}
                  aria-disabled={removing}
                  onClick={() =>
                    void runAction(
                      () => removeDocument(applicationId, pendingRemoval.documentId),
                      MIGRATION_CONTENT.SUCCESS.DOCUMENT_REMOVED,
                      setRemoving
                    )
                  }
                >
                  {CONTENT.REMOVE_CONFIRM}
                </button>
                <button type="button" className="govuk-button govuk-button--secondary" onClick={() => setPendingRemoval(null)}>
                  {CONTENT.REMOVE_CANCEL}
                </button>
              </div>
            </div>
          )}

          <span className="govuk-caption-l">{MIGRATION_CONTENT.CAPTION}</span>
          <h1 className="govuk-heading-l">{title}</h1>

          <h2 className="govuk-heading-m">{CONTENT.MIGRATION_HEADING}</h2>
          <dl className="govuk-summary-list govuk-!-margin-bottom-9">
            {row(
              CONTENT.BATCH_ID,
              migration?.batchId ? (
                <Link className="govuk-link" to={migrationPaths.batch(migration.batchId)}>
                  {migration.batchId}
                </Link>
              ) : (
                MIGRATION_CONTENT.NOT_AVAILABLE
              )
            )}
            {row(CONTENT.LEGACY_CASE_ID, migration?.legacyCaseId || MIGRATION_CONTENT.NOT_AVAILABLE)}
            {row(CONTENT.DESNZ_REF, desnzRef || MIGRATION_CONTENT.NOT_AVAILABLE)}
            {row(CONTENT.APPLICATION_ID, applicationId || MIGRATION_CONTENT.NOT_AVAILABLE)}
            {row(CONTENT.VALIDATION, <MigrationStatusTag kind="validation" status={statuses.validation} />)}
            {row(CONTENT.APPLICANT_LOAD, <MigrationStatusTag kind="awsLoad" status={statuses.awsLoad} />)}
            {row(CONTENT.SALESFORCE, <MigrationStatusTag kind="salesforceLoad" status={statuses.salesforceLoad} />)}
            {row(CONTENT.DOCUMENTS_STATUS, <MigrationStatusTag kind="documentRecord" status={statuses.documentRecord} />)}
            {migration?.failure?.reason && row(CONTENT.FAILURE, migration.failure.reason)}
          </dl>

          <h2 className="govuk-heading-m">{CONTENT.DOCUMENTS_HEADING}</h2>
          {groups.length === 0 && <p className="govuk-body">{CONTENT.NO_DOCUMENTS}</p>}
          {groups.map((group) => (
            <div className="govuk-summary-card" key={group.key}>
              <div className="govuk-summary-card__title-wrapper">
                <h3 className="govuk-summary-card__title">{group.label}</h3>
              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  {group.documents.map((document) => (
                    <div className="govuk-summary-list__row" key={document.documentId}>
                      <dt className="govuk-summary-list__key">{document.fileName}</dt>
                      <dd className="govuk-summary-list__value">
                        <p className="govuk-body govuk-!-margin-bottom-1">
                          {`${CONTENT.UPLOADED_BY}: ${document.uploadedBy || MIGRATION_CONTENT.NOT_AVAILABLE}`}
                        </p>
                        <p className="govuk-body govuk-!-margin-bottom-1">
                          {`${CONTENT.UPLOADED_AT}: ${formatDateTime(document.uploadedAt)}`}
                        </p>
                        <span className="govuk-visually-hidden">{`${CONTENT.SCAN}: `}</span>
                        <ScanStatusTag scanStatus={document.scanStatus} scanResult={document.scanResult} />
                      </dd>
                      <dd className="govuk-summary-list__actions">
                        {document.removable && (
                          <a
                            href="#remove-document-heading"
                            className="govuk-link"
                            onClick={(event) => {
                              event.preventDefault();
                              setSuccess(null);
                              setPendingRemoval(document);
                            }}
                          >
                            {CONTENT.REMOVE}
                            <span className="govuk-visually-hidden"> {document.fileName}</span>
                          </a>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ))}

          <div className="govuk-button-group">
            <Link
              className="govuk-button"
              role="button"
              draggable={false}
              data-module="govuk-button"
              to={migrationPaths.addDocument(desnzRef || applicationId || migratedApplicationId)}
            >
              {CONTENT.ADD_DOCUMENT}
            </Link>
            {!documentsComplete && (
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                disabled={completing}
                aria-disabled={completing}
                onClick={() =>
                  void runAction(
                    () => markDocumentsComplete(applicationId),
                    MIGRATION_CONTENT.SUCCESS.DOCUMENTS_COMPLETE,
                    setCompleting
                  )
                }
              >
                {completing ? CONTENT.MARKING_COMPLETE : CONTENT.MARK_COMPLETE}
              </button>
            )}
          </div>
          {documentsComplete && <p className="govuk-body">{CONTENT.DOCUMENTS_COMPLETE_HINT}</p>}
          <div role="status" aria-live="polite" className="govuk-visually-hidden">
            {completing ? CONTENT.MARKING_COMPLETE : removing ? MIGRATION_CONTENT.LOADING : ''}
          </div>

          <h2 className="govuk-heading-m govuk-!-margin-top-6">{CONTENT.APPLICATION_DATA_HEADING}</h2>
          <p className="govuk-hint">{CONTENT.APPLICATION_DATA_HINT}</p>
          <ApplicationDataSummary data={data.application} />
        </div>
      </div>
    </>
  );
};

const MigratedApplicationRoute = withMigrationAdmin(MigratedApplicationPage);
export default MigratedApplicationRoute;
