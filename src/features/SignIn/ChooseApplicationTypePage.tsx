
import React from 'react';
import ErrorSummary from '../../components/commonFormFields/ErrorSummary';
import { RadioGroup } from './components/RadioGroup';
import { useApplicationTypeSelection } from './hooks/useApplicationTypeSelection';
import { trackButtonClick } from '../../utils/analytics';
import SkipLink from '../../components/SkipLink';

import { APPLICATION_TYPE_OPTIONS } from './constants/applicationTypeOptions';
import { getDisabledFormTypes } from '../../utils/disabledFormTypes';

const ChooseApplicationTypePage: React.FC = () => {

  const { selectedType, error, handleChange, handleSubmit, errors } = useApplicationTypeSelection();

  // Wrap handleSubmit to include tracking
  const handleSubmitWithTracking = (e: React.FormEvent<HTMLFormElement>) => {
    // Track continue button click with selected application type
    trackButtonClick('Continue - Choose application type', '/choose-application', {
      selected_application_type: selectedType,
    });
    
    handleSubmit(e);
  };

  // Disable form types listed in VITE_DISABLED_FORM_TYPES (comma-separated)
  const disabledTypes = getDisabledFormTypes();

  const filteredOptions = APPLICATION_TYPE_OPTIONS.filter(
    option => !disabledTypes.includes(option.value)
  );

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <h1 className="govuk-heading-l">Choose application type</h1>
        
        <ErrorSummary errors={errors} />

        <form onSubmit={handleSubmitWithTracking} noValidate>
          <RadioGroup
            name="applicationType"
            options={filteredOptions}
            selectedValue={selectedType}
            onChange={handleChange}
            error={error}
            errorId="applicationType-error"
          />
          <button
            type="submit"
            className="govuk-button govuk-!-margin-top-6"
            data-module="govuk-button"
          >
            Continue
          </button>
        </form>
      </main>
      </div>
    </>
  );
};

export default ChooseApplicationTypePage;
