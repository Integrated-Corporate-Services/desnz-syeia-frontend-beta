import React from 'react';
import TextInput from '../commonFormFields/TextInput';
import Select from '../commonFormFields/Select';
import Checkbox from '../commonFormFields/Checkbox';

interface FormData {
  fullName: string;
  email: string;
  organisation: string;
  applicantType: string;
  sendWelcomeEmail: boolean;
  accessReason: string;
  phone: string;
  location: string;
}

interface Organisation {
  value: string;
  label: string;
}

interface AddUserPersonalDetailsProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  getFieldError: (fieldId: string) => string;
  organisations: Organisation[];
}

interface AddUserAdditionalDetailsProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  getFieldError: (fieldId: string) => string;
}

interface AddUserReasonProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  getFieldError: (fieldId: string) => string;
}

interface AddUserActionsProps {
  loading: boolean;
  onCancel: () => void;
}

/**
 * Add user personal details section
 */
export const AddUserPersonalDetails: React.FC<AddUserPersonalDetailsProps> = ({
  formData,
  onInputChange,
  getFieldError,
  organisations
}) => (
  <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
      User details
    </legend>

    <TextInput
      id="add-user-full-name"
      name="fullName"
      label="Full name"
      value={formData.fullName}
      error={getFieldError('add-user-full-name')}
      onChange={onInputChange}
    />

    <TextInput
      id="add-user-email"
      name="email"
      type="email"
      label="Email address"
      value={formData.email}
      error={getFieldError('add-user-email')}
      onChange={onInputChange}
    />

    <Select
      id="add-user-organisation"
      name="organisation"
      label="Organisation"
      value={formData.organisation}
      options={organisations}
      error={getFieldError('add-user-organisation')}
      onChange={onInputChange}
      defaultOption="Select an organisation"
    />

    <div className="govuk-form-group">
      <fieldset className="govuk-fieldset">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
          Applicant type
        </legend>

        <div className="govuk-radios" data-module="govuk-radios">
          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="add-user-type-employee"
              name="applicantType"
              type="radio"
              value="employee"
              checked={formData.applicantType === 'employee'}
              onChange={onInputChange}
            />
            <label
              className="govuk-label govuk-radios__label"
              htmlFor="add-user-type-employee"
            >
              Employee
            </label>
          </div>

          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="add-user-type-agent"
              name="applicantType"
              type="radio"
              value="agent"
              checked={formData.applicantType === 'agent'}
              onChange={onInputChange}
            />
            <label
              className="govuk-label govuk-radios__label"
              htmlFor="add-user-type-agent"
            >
              Agent or contractor
            </label>
          </div>
        </div>
      </fieldset>
    </div>
  </fieldset>
);

/**
 * Add user additional details section
 */
export const AddUserAdditionalDetails: React.FC<AddUserAdditionalDetailsProps> = ({
  formData,
  onInputChange,
  getFieldError
}) => (
  <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
      Additional details (optional)
    </legend>

    <TextInput
      id="add-user-phone"
      name="phone"
      type="tel"
      label="Phone number"
      hint="Optional"
      value={formData.phone}
      onChange={onInputChange}
    />

    <TextInput
      id="add-user-location"
      name="location"
      label="Location or department"
      hint="For example: London Office, Operations Team"
      value={formData.location}
      onChange={onInputChange}
    />

    <Checkbox
      id="add-user-send-welcome-email"
      name="sendWelcomeEmail"
      label="Send welcome email to the new user"
      checked={formData.sendWelcomeEmail}
      onChange={onInputChange}
      hint="An email with login instructions will be sent automatically"
      error={getFieldError('add-user-send-welcome-email')}
    />
  </fieldset>
);

/**
 * Add user reason section
 */
export const AddUserReason: React.FC<AddUserReasonProps> = ({
  formData,
  onInputChange,
  getFieldError
}) => (
  <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
      Reason for manual addition
    </legend>

    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor="add-user-access-reason">
        Why is this user being added manually?
      </label>
      <div className="govuk-hint">
        For example: Urgent access required, email request received, emergency access
      </div>
      {getFieldError('add-user-access-reason') && (
        <p className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span>
          {getFieldError('add-user-access-reason')}
        </p>
      )}

      <textarea
        className={`govuk-textarea ${getFieldError('add-user-access-reason') ? 'govuk-textarea--error' : ''}`}
        id="add-user-access-reason"
        name="accessReason"
        rows={4}
        value={formData.accessReason}
        onChange={onInputChange}
      />
    </div>
  </fieldset>
);

/**
 * Add user form actions
 */
export const AddUserActions: React.FC<AddUserActionsProps> = ({ loading, onCancel }) => (
  <div className="govuk-button-group">
    <button
      type="submit"
      className="govuk-button"
      disabled={loading}
    >
      {loading ? 'Creating user...' : 'Create user'}
    </button>

    <button
      type="button"
      className="govuk-button govuk-button--secondary"
      onClick={onCancel}
      disabled={loading}
    >
      Cancel
    </button>
  </div>
);

/**
 * Add user sidebar with help information
 */
export const AddUserSidebar: React.FC = () => (
  <aside className="app-related-items" role="complementary">
    <h2 className="govuk-heading-s" id="help-content-title">
      Help with adding users
    </h2>

    <nav role="navigation" aria-labelledby="help-content-title">
      <ul className="govuk-list govuk-list--spaced">
        <li><a href="#" className="govuk-link">User management guidelines</a></li>
        <li><a href="#" className="govuk-link">When to add users manually</a></li>
        <li><a href="#" className="govuk-link">Email templates and notifications</a></li>
        <li><a href="#" className="govuk-link">User roles and permissions</a></li>
      </ul>
    </nav>

    <div className="govuk-inset-text govuk-!-margin-top-4">
      <p className="govuk-body-s">
        <strong>Need help?</strong>
      </p>
      <p className="govuk-body-s">
        Contact the support team at{' '}
        <a href="mailto:support@example.gov.uk" className="govuk-link">
          support@example.gov.uk
        </a>
      </p>
    </div>
  </aside>
);
