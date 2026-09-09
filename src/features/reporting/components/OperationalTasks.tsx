import React from "react";
import { VERIFIABLE_APPLICATION_STATUS, VERIFIABLE_PAYMENT_STATUS } from "../constants";
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
    search,
    verifyApplicationPayment,
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
            Application reference
          </label>
          <div className="govuk-hint">
            For example, EN-123456 or an application ID. Records you open are logged against your account.
          </div>
          <input
            className="govuk-input govuk-input--width-20"
            id="application-reference"
            type="text"
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
              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Reference</dt>
                  <dd className="govuk-summary-list__value">{result.desnzRef || result.applicationId}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Started</dt>
                  <dd className="govuk-summary-list__value">{formatStartedAt(result.startedAt)}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Application status</dt>
                  <dd className="govuk-summary-list__value">
                    <strong className="govuk-tag">{result.applicationStatus}</strong>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="govuk-grid-column-one-half">
              <h2 className="govuk-heading-l">Payment</h2>
              {result.payment ? (
                <dl className="govuk-summary-list">
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Amount</dt>
                    <dd className="govuk-summary-list__value">{formatCurrency(result.payment.amount)}</dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Status</dt>
                    <dd className="govuk-summary-list__value">
                      <strong className="govuk-tag">{result.payment.status}</strong>
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Payment reference</dt>
                    <dd className="govuk-summary-list__value">{result.payment.paymentId || "Not available"}</dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Provider</dt>
                    <dd className="govuk-summary-list__value">{result.payment.provider || "Not available"}</dd>
                  </div>
                </dl>
              ) : (
                <p className="govuk-body">No payment has been recorded for this application.</p>
              )}
            </div>
          </div>

          {result.canVerifyPayment && (
            <div className="govuk-inset-text operational-tasks__recovery">
              <h2 className="govuk-heading-m">Submission recovery</h2>
              <p className="govuk-body">
                Advances a live application. Needs the <strong>Support (elevated)</strong> role.
              </p>
              <button
                className="govuk-button govuk-button--warning"
                type="button"
                disabled={verifying}
                onClick={() => void verifyApplicationPayment()}
              >
                {verifying ? "Verifying" : "Reconcile and retry submission"}
              </button>
              <p className="govuk-body-s">Recorded against your account. Safe to run more than once.</p>
              {verifyMessage && <p className="govuk-body" role="status">{verifyMessage}</p>}
              {verifyError && <p className="govuk-error-message">{verifyError}</p>}
            </div>
          )}

          {!result.canVerifyPayment && (
            <p className="govuk-hint">
              Submission recovery is only available when the application status is {VERIFIABLE_APPLICATION_STATUS} and
              the payment status is {VERIFIABLE_PAYMENT_STATUS}.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OperationalTasks;
