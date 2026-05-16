import React, { useState, useEffect } from 'react';
import { LABELS } from '../constants/objectorDetailsConstants';
import { useObjectorDetailsData, useFormValidation, useObjectorNavigation } from '../hooks';
import { 
  ObjectorDetailsBreadcrumbs, 
  ErrorSummary, 
  PersonDetailsForm, 
  FormActions,
  Loading,
  ErrorMessage 
} from '../components';
import { saveObjectorPersonalInfo } from '../services';

const ObjectorDetails: React.FC = () => {
  const { appId, objectorDetails, isLoading, error } = useObjectorDetailsData();
  const { errors, validatePersonDetails } = useFormValidation();
  const { navigateToObjectorAddress, navigateToTaskList } = useObjectorNavigation(appId);

  const [title, setTitle] = useState('');
  const [fullName, setFullName] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (objectorDetails) {
      setTitle(objectorDetails.objector_title || '');
      setFullName(objectorDetails.objector_full_name || '');
      setOrganisation(objectorDetails.objector_organisation || '');
      setEmail(objectorDetails.objector_email || '');
      setPhone(objectorDetails.objector_phone || '');
    }
  }, [objectorDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePersonDetails(fullName, email)) {
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
    } catch (error) {
      console.error('Error saving objector details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <ObjectorDetailsBreadcrumbs appId={appId} />

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.OBJECTOR_DETAILS_TITLE}</h1>

            {isLoading && <Loading />}

            {error && <ErrorMessage message={error} />}

            {!isLoading && !error && (
              <>
                <ErrorSummary errors={errors} />

                <form onSubmit={handleSubmit} noValidate>
                  <PersonDetailsForm
                    title={title}
                    fullName={fullName}
                    organisation={organisation}
                    email={email}
                    phone={phone}
                    errors={errors}
                    onTitleChange={setTitle}
                    onFullNameChange={setFullName}
                    onOrganisationChange={setOrganisation}
                    onEmailChange={setEmail}
                    onPhoneChange={setPhone}
                  />

                  <FormActions 
                    isSaving={isSaving}
                  />
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ObjectorDetails;
