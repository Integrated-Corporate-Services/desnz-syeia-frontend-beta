// Components for reviewing access requests
import React from "react";

interface RequestData {
  access_request_id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation_name?: string;
  is_agent: boolean;
  requested_at: string;
  agency_name?: string;
  company_number?: string;
  agency_address?: string;
}

interface ApplicantDetailsProps {
  requestData: RequestData;
}

export const ApplicantDetails: React.FC<ApplicantDetailsProps> = ({
  requestData,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <dl className="govuk-summary-list govuk-!-margin-bottom-6">
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">Full name</dt>
        <dd className="govuk-summary-list__value">
          {requestData.first_name} {requestData.last_name}
        </dd>
      </div>

      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">Email address</dt>
        <dd className="govuk-summary-list__value">{requestData.email}</dd>
      </div>

      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">Organisation</dt>
        <dd className="govuk-summary-list__value">
          {requestData.organisation_name || "N/A"}
        </dd>
      </div>

      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">Applicant type</dt>
        <dd className="govuk-summary-list__value">
          {/* TODO: Replace inline styles with GOV.UK Design System tag modifiers */}
          <strong
            className="govuk-tag"
            style={{
              backgroundColor: !requestData.is_agent ? "#1d70b8" : "#505a5f",
              color: "#ffffff",
            }}
          >
            {!requestData.is_agent ? "Employee" : "Agent"}
          </strong>
        </dd>
      </div>

      {requestData.is_agent && (
        <>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Agency Name</dt>
            <dd className="govuk-summary-list__value">
              {requestData.agency_name || "N/A"}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Agency Address</dt>
            <dd className="govuk-summary-list__value">
              {requestData.agency_address ? (
                <>{requestData.agency_address}</>
              ) : (
                "N/A"
              )}
            </dd>
          </div>
        </>
      )}

      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">Request submitted</dt>
        <dd className="govuk-summary-list__value">
          {formatDate(requestData.requested_at)}
        </dd>
      </div>
    </dl>
  );
};

interface RejectionReasonFormProps {
  rejectReason: string;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  processing: boolean;
  error: string;
}

export const RejectionReasonForm: React.FC<RejectionReasonFormProps> = ({
  rejectReason,
  onReasonChange,
  onSubmit,
  onCancel,
  processing,
  error,
}) => (
  <div className="govuk-form-group govuk-!-margin-bottom-6">
    <label className="govuk-label govuk-label--m" htmlFor="reject-reason">
      Reason for rejection
    </label>
    <div className="govuk-hint" id="reject-reason-hint">
      Explain why this request is being rejected. This will be included in the
      email sent to the applicant.
    </div>

    {error && (
      <p className="govuk-error-message" id="reject-reason-error">
        <span className="govuk-visually-hidden">Error:</span> {error}
      </p>
    )}

    <textarea
      className={`govuk-textarea ${error ? "govuk-textarea--error" : ""}`}
      id="reject-reason"
      rows={4}
      value={rejectReason}
      onChange={(e) => onReasonChange(e.target.value)}
      aria-describedby={
        error ? "reject-reason-error reject-reason-hint" : "reject-reason-hint"
      }
    />

    <div className="govuk-button-group govuk-!-margin-top-4">
      <button
        type="button"
        className="govuk-button govuk-button--warning"
        onClick={onSubmit}
        disabled={processing}
      >
        {processing ? "Processing..." : "Confirm rejection"}
      </button>

      <a
        href="#"
        className="govuk-link"
        onClick={(e) => {
          e.preventDefault();
          onCancel();
        }}
      >
        Cancel
      </a>
    </div>
  </div>
);

interface ActionButtonsProps {
  processing: boolean;
  showRejectReason: boolean;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  processing,
  onApprove,
  onReject,
}) => (
  <div className="govuk-button-group">
    <button
      type="button"
      className="govuk-button"
      onClick={onApprove}
      disabled={processing}
    >
      {processing ? "Processing..." : "Approve access"}
    </button>

    <button
      type="button"
      className="govuk-button govuk-button--secondary"
      onClick={onReject}
      disabled={processing}
    >
      Reject request
    </button>
  </div>
);

export const RelatedContentSidebar: React.FC = () => (
  <aside className="app-related-items" role="complementary">
    {/* TODO: Move inline styles to CSS file */}
    <hr
      style={{
        border: "none",
        borderTop: "1px solid #b1b4b6",
        margin: "0 0 16px 0",
      }}
    />
    <h2 className="govuk-heading-s" id="related-content-title">
      Related content
    </h2>
    <nav role="navigation" aria-labelledby="related-content-title">
      <ul className="govuk-list govuk-list--spaced">
        {/* TODO: Replace placeholder links with actual documentation URLs */}
        <li>
          <a className="govuk-link" href="#">
            Guidelines for reviewing requests
          </a>
        </li>
        <li>
          <a className="govuk-link" href="#">
            Types of applicants
          </a>
        </li>
        <li>
          <a className="govuk-link" href="#">
            When to approve or reject
          </a>
        </li>
        <li>
          <a className="govuk-link" href="#">
            Contact support team
          </a>
        </li>
      </ul>
    </nav>
  </aside>
);
