import React from "react";
import { DOWNLOAD_RECOVERY_APPLICATION_STATUS, OPERATIONAL_TASKS_MESSAGES, VERIFIABLE_APPLICATION_STATUS, VERIFIABLE_PAYMENT_STATUS } from "../constants";
import { useApplicationStatusLookup } from "../hooks/useApplicationStatusLookup";

const formatCurrency = (amountInPence: number | null): string => {
  if (amountInPence === null || amountInPence === undefined) return "Not available";
  return `£${(amountInPence / 100).toFixed(2)}`;
};

const formatStartedAt = (isoDateTime: string): string => new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Europe/London",
}).format(new Date(isoDateTime));

const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) return `${sizeInBytes} bytes`;
  const sizeInMb = sizeInBytes / (1024 * 1024);
  if (sizeInMb >= 1) return `${sizeInMb.toFixed(1)} MB`;
  return `${(sizeInBytes / 1024).toFixed(1)} KB`;
};

// Maps a status value to a GOV.UK tag colour, mirroring the tag palette used across
// the reference operational-tasks design (green = good/final, yellow = attention
// needed, grey = neutral/in progress).
const statusTagClass = (status: string | null | undefined): string => {
  const normalised = (status || "").toUpperCase();
  if (["SUCCESS", "SUBMITTED", "COMPLETED"].includes(normalised)) return "govuk-tag govuk-tag--green";
  if (["DRAFT", "CREATED"].includes(normalised)) return "govuk-tag govuk-tag--yellow";
  if (["FAILED", "CANCELLED"].includes(normalised)) return "govuk-tag govuk-tag--red";
  return "govuk-tag govuk-tag--grey";
};

const OperationalTasks: React.FC = () => {
  const {
    reference,
    setReference,
    result,
    loading,
    error,
    verifying,
    verifyMessage,
    verifyError,
    documentExport,
    checkingDocumentExport,
    buildingDocumentExport,
    documentExportError,
    search,
    reconcileSubmission,
    buildDownloadBundle,
  } = useApplicationStatusLookup();

  return (
    <div className="operational-tasks">
      <h1 className="govuk-heading-xl">Operational tasks</h1>
      <p className="govuk-body">Recover stalled submissions and rebuild missing application downloads.</p>

      <div className="govuk-tabs" data-module="govuk-tabs">
        <ul className="govuk-tabs__list">
          <li className="govuk-tabs__list-item govuk-tabs__list-item--selected">
            <span className="govuk-tabs__tab">One application</span>
          </li>
        </ul>
      </div>

      <form
        className="operational-tasks__search"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="application-reference">
            {OPERATIONAL_TASKS_MESSAGES.REFERENCE_LABEL}
          </label>
          <div className="govuk-hint" id="application-reference-hint">
            {OPERATIONAL_TASKS_MESSAGES.REFERENCE_HINT}
          </div>
          <input
            className="govuk-input govuk-input--width-20"
            id="application-reference"
            type="text"
            aria-describedby="application-reference-hint"
            autoComplete="off"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
        </div>
        <button className="govuk-button" type="submit" disabled={loading}>
          {loading ? "Searching" : "Search"}
        </button>
      </form>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p>{error}</p>
          </div>
        </div>
      )}

      {result && !error && (
        <div className="operational-tasks__result">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <h2 className="govuk-heading-l">Application</h2>
              <table className="govuk-table operational-tasks__summary">
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <th className="govuk-table__header" scope="row">Reference</th>
                    <td className="govuk-table__cell">{result.desnzRef || result.applicationId}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th className="govuk-table__header" scope="row">Started</th>
                    <td className="govuk-table__cell">{formatStartedAt(result.startedAt)}</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th className="govuk-table__header" scope="row">Application status</th>
                    <td className="govuk-table__cell">
                      <strong className={statusTagClass(result.applicationStatus)}>{result.applicationStatus}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="govuk-grid-column-one-half">
              <h2 className="govuk-heading-l">Payment</h2>
              {result.payment ? (
                <table className="govuk-table operational-tasks__summary">
                  <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                      <th className="govuk-table__header" scope="row">Amount</th>
                      <td className="govuk-table__cell">{formatCurrency(result.payment.amount)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th className="govuk-table__header" scope="row">Status</th>
                      <td className="govuk-table__cell">
                        <strong className={statusTagClass(result.payment.status)}>{result.payment.status}</strong>
                      </td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th className="govuk-table__header" scope="row">Reference</th>
                      <td className="govuk-table__cell">{result.payment.paymentId || "Not available"}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th className="govuk-table__header" scope="row">Provider</th>
                      <td className="govuk-table__cell">{result.payment.provider || "Not available"}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="govuk-body">No payment has been recorded for this application.</p>
              )}
            </div>
          </div>

          <h2 className="govuk-heading-l">Available operations</h2>

          <div className="operational-tasks__actions">
            <h3 className="govuk-heading-m">Download recovery</h3>
            <p className="operational-tasks__actions-note">Rebuilds a derived file. Does not change the application.</p>
            {result.applicationStatus === DOWNLOAD_RECOVERY_APPLICATION_STATUS ? (
              <>
                {checkingDocumentExport && <p className="govuk-body">Checking for an existing download bundle…</p>}
                {!checkingDocumentExport && documentExport && (
                  <>
                    <p className="govuk-body">
                      Bundle built on {formatStartedAt(documentExport.completedAt)}, {formatFileSize(documentExport.archiveSizeBytes)}.
                    </p>
                    <a
                      className="govuk-button"
                      href={documentExport.downloadUrl}
                      data-module="govuk-button"
                    >
                      Download bundle
                    </a>
                    <button
                      className="govuk-button govuk-button--secondary"
                      type="button"
                      disabled={buildingDocumentExport}
                      onClick={() => void buildDownloadBundle()}
                    >
                      {buildingDocumentExport ? "Rebuilding" : "Rebuild bundle"}
                    </button>
                  </>
                )}
                {!checkingDocumentExport && !documentExport && (
                  <>
                    <p className="govuk-body">No download bundle exists for this application.</p>
                    <button
                      className="govuk-button"
                      type="button"
                      disabled={buildingDocumentExport}
                      onClick={() => void buildDownloadBundle()}
                    >
                      {buildingDocumentExport ? "Building" : "Build download bundle"}
                    </button>
                  </>
                )}
                {documentExportError && <p className="govuk-error-message">{documentExportError}</p>}
              </>
            ) : (
              <p className="govuk-hint">
                Not available. This application must be in {DOWNLOAD_RECOVERY_APPLICATION_STATUS} status.
              </p>
            )}
          </div>

          {result.canVerifyPayment ? (
            <div className="operational-tasks__actions operational-tasks__actions--elevated">
              <h3 className="govuk-heading-m">Submission recovery</h3>
              <p className="operational-tasks__actions-note">
                Advances a live application. Needs the <strong>Support (elevated)</strong> role.
              </p>
              <button
                className="govuk-button govuk-button--warning"
                type="button"
                disabled={verifying}
                onClick={() => void reconcileSubmission()}
              >
                {verifying ? "Working" : "Reconcile and retry submission"}
              </button>
              <p className="govuk-hint">Recorded against your account with the reason you give. Safe to run more than once.</p>
              {verifyMessage && <p className="govuk-body" role="status">{verifyMessage}</p>}
              {verifyError && <p className="govuk-error-message">{verifyError}</p>}
            </div>
          ) : (
            <div className="operational-tasks__actions">
              <h3 className="govuk-heading-m">Submission recovery</h3>
              <p className="govuk-hint">
                Not available. This application must be in {VERIFIABLE_APPLICATION_STATUS} status with a payment in
                the {VERIFIABLE_PAYMENT_STATUS} status.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OperationalTasks;
