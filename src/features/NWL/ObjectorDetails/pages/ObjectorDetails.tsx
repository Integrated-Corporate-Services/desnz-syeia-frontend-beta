import React, { useState, useEffect } from 'react';
import { LABELS } from '../constants/objectorDetailsConstants';
import { useObjectorDetailsData, useFormValidation, useObjectorNavigation } from '../hooks';
import { ObjectorDetailsBreadcrumbs, ErrorSummary, PersonDetailsForm, FormActions } from '../components';

const ObjectorDetails: React.FC = () => {
  const { appId, objectorDetails } = useObjectorDetailsData();
  const { errors, validatePersonDetails } = useFormValidation();
  const { navigateToObjectorAddress, navigateToTaskList } = useObjectorNavigation(appId);

  const [title, setTitle] = useState('');
  const [fullName, setFullName] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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

    navigateToObjectorAddress();
  };

  return (
    <div className="govuk-width-container">
      <ObjectorDetailsBreadcrumbs appId={appId} />

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.OBJECTOR_DETAILS_TITLE}</h1>

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

              <FormActions onSaveForLater={navigateToTaskList} />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ObjectorDetails;
