
import React from 'react';
import ErrorSummary from '../../components/commonFormFields/ErrorSummary';
import { RadioGroup } from './components/RadioGroup';
import { useApplicationTypeSelection } from './hooks/useApplicationTypeSelection';
import { APPLICATION_TYPE_OPTIONS } from './constants/applicationTypeOptions';

const ChooseApplicationTypePage: React.FC = () => {
  const { selectedType, error, handleChange, handleSubmit, errors } = useApplicationTypeSelection();

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <h1 className="govuk-heading-l">Choose application type</h1>
        
        <ErrorSummary errors={errors} />

        <form onSubmit={handleSubmit} noValidate>
          <RadioGroup
            name="applicationType"
            options={APPLICATION_TYPE_OPTIONS}
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
  );
};

export default ChooseApplicationTypePage;
