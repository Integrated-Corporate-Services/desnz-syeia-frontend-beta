import React, { useState, useEffect } from 'react';
import SkipLink from '../../../../components/SkipLink';
import { LABELS } from '../constants/objectorDetailsConstants';
import { useObjectorDetailsData, useFormValidation, useObjectorNavigation } from '../hooks';
import { ObjectorDetailsBreadcrumbs, ErrorSummary, PersonDetailsForm, FormActions } from '../components';
import { saveObjectorPersonalInfo } from '../services';

const ObjectorDetails: React.FC = () => {
  const { appId, objectorDetails } = useObjectorDetailsData();
  const { errors, validatePersonDetails, clearFieldError } = useFormValidation();
  const { navigateToObjectorAddress } = useObjectorNavigation(appId);

  const [title, setTitle] = useState('');
  const [fullName, setFullName] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (objectorDetails) {
      setTitle(objectorDetails.objector_title || '');
      setFullName(objectorDetails.objector_full_name || '');
      setOrganisation(objectorDetails.objector_organisation || '');
      setEmail(objectorDetails.objector_email || '');
      setPhone(objectorDetails.objector_phone || '');
    }
  }, [objectorDetails]);

  /**
   * Map backend validation error field names to frontend field names
   */
  const mapBackendErrorFields = (validationErrors: any): { [key: string]: string } => {
    const mappedErrors: { [key: string]: string } = {};
    
    if (validationErrors && typeof validationErrors === 'object') {
      if (validationErrors.objector_email) {
        mappedErrors.email = validationErrors.objector_email;
      }
      if (validationErrors.objector_phone) {
        mappedErrors.phone = validationErrors.objector_phone;
      }
      if (validationErrors.objector_full_name) {
        mappedErrors.fullName = validationErrors.objector_full_name;
      }
      if (validationErrors.objector_title) {
        mappedErrors.title = validationErrors.objector_title;
      }
      if (validationErrors.objector_organisation) {
        mappedErrors.organisation = validationErrors.objector_organisation;
      }
    }
    
    return mappedErrors;
  };

  const handleClearFieldError = (fieldName: string) => {
    // Clear from backend validation errors
    setFormErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
    // Clear from client-side validation errors
    clearFieldError(fieldName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side validation (includes optional field format validation)
    if (!validatePersonDetails(fullName, email, phone)) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      return;
    }

    setIsSaving(true);

    try {
      await saveObjectorPersonalInfo(appId, {
        objector_title: title,
        objector_full_name: fullName,
        objector_organisation: organisation,
        objector_email: email,
        objector_phone: phone,
      });

      navigateToObjectorAddress();
    } catch (error: any) {
      // Handle backend validation errors
      if (error.status === 400 && error.validationErrors) {
        const backendErrors = mapBackendErrorFields(error.validationErrors);
        setFormErrors(backendErrors);
      } else {
        // Generic error
        setFormErrors({
          submit: error.message || 'Failed to save objector details. Please try again.'
        });
      }
      
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <ObjectorDetailsBreadcrumbs appId={appId} />

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.OBJECTOR_DETAILS_TITLE}</h1>

            {formErrors.submit && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
              >
                <h2 className="govuk-error-summary__title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <p>{formErrors.submit}</p>
                </div>
              </div>
            )}

            <ErrorSummary errors={{ ...errors, ...formErrors }} />

            <form onSubmit={handleSubmit} noValidate>
              <PersonDetailsForm
                title={title}
                fullName={fullName}
                organisation={organisation}
                email={email}
                phone={phone}
                errors={{ ...errors, ...formErrors }}
                onTitleChange={(value) => {
                  setTitle(value);
                  handleClearFieldError('title');
                }}
                onFullNameChange={(value) => {
                  setFullName(value);
                  handleClearFieldError('fullName');
                }}
                onOrganisationChange={(value) => {
                  setOrganisation(value);
                  handleClearFieldError('organisation');
                }}
                onEmailChange={(value) => {
                  setEmail(value);
                  handleClearFieldError('email');
                }}
                onPhoneChange={(value) => {
                  setPhone(value);
                  handleClearFieldError('phone');
                }}
              />

              <FormActions 
                isSaving={isSaving}
              />
            </form>
          </div>
        </div>
      </main>
      </div>
    </>
  );
};

export default ObjectorDetails;
