import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAddUser, useAddUserNavigation } from '../../../hooks';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import SkipLink from '../../../components/SkipLink';
import {
  AddUserPersonalDetails,
  AddUserAdditionalDetails,
  AddUserReason,
  AddUserActions,
  AddUserSidebar
} from '../../../components/shared/AddUserComponents';

const AddUserPage: React.FC = () => {
  const {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    getFieldError
  } = useAddUser();

  const {
    navigateToManageUsers,
    navigateToUserCreated
  } = useAddUserNavigation();

  // State for organisations fetched from API
  const [organisations, setOrganisations] = useState<Array<{ value: string; label: string }>>([]);

  // Fetch organisations on component mount
  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const response = await axios.get('/backend/api/organisations');
        const orgs = response.data.map((org: { organisation_id: string; organisation_name: string }) => ({
          value: org.organisation_id,
          label: org.organisation_name
        }));
        setOrganisations(orgs);
      } catch {
        setOrganisations([]);
      }
    };

    fetchOrganisations();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    handleSubmit(e, navigateToUserCreated);
  };

  const handleCancel = () => {
    navigateToManageUsers();
  };

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">

        <a
          href="#"
          className="govuk-back-link"
          onClick={(e) => {
            e.preventDefault();
            navigateToManageUsers();
          }}
        >
          Back
        </a>

        {errors.length > 0 && (
          <ErrorSummary errors={errors} />
        )}

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            <h1 className="govuk-heading-l">Add user manually</h1>

            <p className="govuk-body govuk-!-margin-bottom-6">
              Use this form to add users who have requested access via email or when immediate access is required.
            </p>

            <div className="govuk-inset-text">
              <p className="govuk-body-s govuk-!-margin-bottom-1">
                <strong>Note:</strong> Users created manually will be automatically activated and can access the service immediately.
              </p>
              <p className="govuk-body-s govuk-!-margin-bottom-0">
                They will receive an email notification with sign-in instructions.
              </p>
            </div>

            <form onSubmit={handleSave}>

              <AddUserPersonalDetails
                formData={formData}
                onInputChange={handleInputChange}
                getFieldError={getFieldError}
                organisations={organisations}
              />

              <AddUserAdditionalDetails
                formData={formData}
                onInputChange={handleInputChange}
                getFieldError={getFieldError}
              />

              <AddUserReason
                formData={formData}
                onInputChange={handleInputChange}
                getFieldError={getFieldError}
              />

              <AddUserActions
                loading={loading}
                onCancel={handleCancel}
              />

            </form>

          </div>

          <div className="govuk-grid-column-one-third">
            <AddUserSidebar />
          </div>

        </div>
      </main>
    </div>
    </>
  );
};

export default AddUserPage;
