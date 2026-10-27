// Components for reviewing access requests
import React from 'react';
import '../../styles/RelatedContent.css';
import { formatDateAtTime } from '../../utils/formatters';
import { REVIEW_REQUEST_COMPONENTS_CONSTANTS, ADMIN_COMMON_CONSTANTS } from '../../features/admin/constants/userManagementConstants';

interface RequestData {
  access_request_id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation_name?: string;
  is_agent: boolean;
  agency_name?: string;
  requested_at: string;
}

interface ApplicantDetailsProps {
  requestData: RequestData;
}

export const ApplicantDetails: React.FC<ApplicantDetailsProps> = ({ requestData }) => {
  return (
    <dl className="govuk-summary-list govuk-!-margin-bottom-6">
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{REVIEW_REQUEST_COMPONENTS_CONSTANTS.APPLICANT_DETAILS.FULL_NAME}</dt>
        <dd className="govuk-summary-list__value">
          {requestData.first_name} {requestData.last_name}
        </dd>
      </div>

      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{REVIEW_REQUEST_COMPONENTS_CONSTANTS.APPLICANT_DETAILS.EMAIL_ADDRESS}</dt>
        <dd className="govuk-summary-list__value">{requestData.email}</dd>
      </div>

      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{REVIEW_REQUEST_COMPONENTS_CONSTANTS.APPLICANT_DETAILS.ORGANISATION}</dt>
        <dd className="govuk-summary-list__value">
          {requestData.organisation_name || ADMIN_COMMON_CONSTANTS.NOT_APPLICABLE}
        </dd>
      </div>

      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{REVIEW_REQUEST_COMPONENTS_CONSTANTS.APPLICANT_DETAILS.AGENT_OR_EMPLOYEE}</dt>
        <dd className="govuk-summary-list__value">
          {/* TODO: Replace inline styles with GOV.UK Design System tag modifiers */}
          <strong
            className="govuk-tag"
            style={{
              backgroundColor: !requestData.is_agent ? '#1d70b8' : '#505a5f',
              color: '#ffffff'
            }}
          >
            {!requestData.is_agent ? REVIEW_REQUEST_COMPONENTS_CONSTANTS.APPLICANT_DETAILS.EMPLOYEE : REVIEW_REQUEST_COMPONENTS_CONSTANTS.APPLICANT_DETAILS.AGENT}
          </strong>
        </dd>
      </div>

      {requestData.is_agent && requestData.agency_name && (
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{REVIEW_REQUEST_COMPONENTS_CONSTANTS.APPLICANT_DETAILS.AGENCY_NAME}</dt>
          <dd className="govuk-summary-list__value">{requestData.agency_name}</dd>
        </div>
      )}

      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{REVIEW_REQUEST_COMPONENTS_CONSTANTS.APPLICANT_DETAILS.REQUESTED_ON}</dt>
        <dd className="govuk-summary-list__value">
          {formatDateAtTime(requestData.requested_at)}
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
  error
}) => (
  <div className="govuk-form-group govuk-!-margin-bottom-6">
    <label className="govuk-label govuk-label--m" htmlFor="reject-reason">
      {REVIEW_REQUEST_COMPONENTS_CONSTANTS.REJECTION_FORM.LABEL}
    </label>
    <div className="govuk-hint" id="reject-reason-hint">
      {REVIEW_REQUEST_COMPONENTS_CONSTANTS.REJECTION_FORM.HINT}
    </div>

    {error && (
      <p className="govuk-error-message" id="reject-reason-error">
        <span className="govuk-visually-hidden">{ADMIN_COMMON_CONSTANTS.ERROR_PREFIX}</span> {error}
      </p>
    )}

    <textarea
      className={`govuk-textarea ${error ? 'govuk-textarea--error' : ''}`}
      id="reject-reason"
      rows={4}
      value={rejectReason}
      onChange={(e) => onReasonChange(e.target.value)}
      aria-describedby={error ? 'reject-reason-error reject-reason-hint' : 'reject-reason-hint'}
    />

    <div className="govuk-button-group govuk-!-margin-top-4">
      <button
        type="button"
        className="govuk-button govuk-button--warning"
        onClick={onSubmit}
        disabled={processing}
      >
        {processing ? ADMIN_COMMON_CONSTANTS.PROCESSING : REVIEW_REQUEST_COMPONENTS_CONSTANTS.REJECTION_FORM.CONFIRM}
      </button>

      <a
        href="#"
        className="govuk-link"
        onClick={(e) => {
          e.preventDefault();
          onCancel();
        }}
      >
        {REVIEW_REQUEST_COMPONENTS_CONSTANTS.REJECTION_FORM.CANCEL}
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
  onReject
}) => (
  <div className="govuk-button-group">
    <button
      type="button"
      className="govuk-button"
      onClick={onApprove}
      disabled={processing}
    >
      {processing ? ADMIN_COMMON_CONSTANTS.PROCESSING : REVIEW_REQUEST_COMPONENTS_CONSTANTS.ACTION_BUTTONS.APPROVE}
    </button>

    <button
      type="button"
      className="govuk-button govuk-button--secondary"
      onClick={onReject}
      disabled={processing}
    >
      {REVIEW_REQUEST_COMPONENTS_CONSTANTS.ACTION_BUTTONS.REJECT}
    </button>
  </div>
);

export const RelatedContentSidebar: React.FC = () => (
  <aside className="app-related-items" role="complementary">
    <div className="app-related-items__divider" aria-hidden="true" />
    <h2 className="govuk-heading-s" id="related-content-title">{REVIEW_REQUEST_COMPONENTS_CONSTANTS.RELATED_CONTENT.HEADING}</h2>
    <nav role="navigation" aria-labelledby="related-content-title">
      <ul className="govuk-list govuk-list--spaced">
        {/* TODO: Replace placeholder links with actual documentation URLs */}
        <li><a className="govuk-link" href="#">{REVIEW_REQUEST_COMPONENTS_CONSTANTS.RELATED_CONTENT.GUIDELINES}</a></li>
        <li><a className="govuk-link" href="#">{REVIEW_REQUEST_COMPONENTS_CONSTANTS.RELATED_CONTENT.APPLICANT_TYPES}</a></li>
        <li><a className="govuk-link" href="#">{REVIEW_REQUEST_COMPONENTS_CONSTANTS.RELATED_CONTENT.APPROVE_OR_REJECT}</a></li>
        <li><a className="govuk-link" href="#">{REVIEW_REQUEST_COMPONENTS_CONSTANTS.RELATED_CONTENT.CONTACT_SUPPORT}</a></li>
      </ul>
    </nav>
  </aside>
);
