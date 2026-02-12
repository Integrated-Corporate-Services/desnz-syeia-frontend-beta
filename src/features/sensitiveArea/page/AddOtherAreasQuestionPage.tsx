import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';

/**
 * AddOtherAreasQuestionPage Component
 * 
 * Asks the user if they want to add any other sensitive areas that are not automatically checked.
 * Part of the sensitive area review workflow (Wireframe C).
 * 
 * User Flow:
 * - If user selects "Yes": Navigate to AddOtherAreasPage to add manual areas
 * - If user selects "No": Navigate to the next step in the workflow
 * 
 * Features:
 * - GDS-compliant radio button group
 * - Form validation (requires selection)
 * - Save and continue / Save for later functionality
 */
const AddOtherAreasQuestionPage: React.FC = () => {
  // ===========================
  // HOOKS & STATE MANAGEMENT
  // ===========================
  const { applicationId } = useParams<{ applicationId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');
  const effectiveApplicationId = applicationId || queryId || '';

  // Form State
  const [selectedOption, setSelectedOption] = useState<'yes' | 'no' | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ===========================
  // VALIDATION LOGIC
  // ===========================
  
  /**
   * Validates that user has selected an option
   */
  const validateForm = (): boolean => {
    if (!selectedOption) {
      setValidationError('Please select Yes or No');
      return false;
    }
    setValidationError(null);
    return true;
  };

  // ===========================
  // EVENT HANDLERS
  // ===========================

  /**
   * Handles radio button selection change
   */
  const handleRadioChange = (option: 'yes' | 'no') => {
    setSelectedOption(option);
    setValidationError(null); // Clear validation error on selection
  };

  /**
   * Handles "Save and continue" with validation
   */
  const handleSaveAndContinue = () => {
    if (!effectiveApplicationId) return;

    if (!validateForm()) return;

    // Navigate based on user's selection
    if (selectedOption === 'yes') {
      // Navigate to AddOtherAreasPage to allow manual entry
      navigate(`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-add-areas`);
    } else {
      // Navigate to the next step in the workflow (task list for now)
      navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
    }
  };

  /**
   * Handles "Save for later" without validation
   */
  const handleSaveForLater = () => {
    if (!effectiveApplicationId) return;

    // Save partial progress and return to task list
    navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        {/* Main Heading */}
        <h1 className="govuk-heading-xl">
          Do you want to add any other sensitive areas?
        </h1>

        {/* Guidance Paragraph */}
        <p className="govuk-body">
          These should only be any areas that are not automatically checked.
        </p>

        {/* Validation Error Summary */}
        {validationError && (
          <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title">
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li>
                  <a href="#add-other-areas-yes">{validationError}</a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Radio Button Group */}
        <div className={`govuk-form-group ${validationError ? 'govuk-form-group--error' : ''}`}>
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
              <h2 className="govuk-fieldset__heading">
                Select an option
              </h2>
            </legend>

            {/* Error Message (displayed above radio buttons) */}
            {validationError && (
              <p id="add-other-areas-error" className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span> {validationError}
              </p>
            )}

            <div className="govuk-radios" data-module="govuk-radios">
              {/* Yes Option */}
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="add-other-areas-yes"
                  name="add-other-areas"
                  type="radio"
                  value="yes"
                  checked={selectedOption === 'yes'}
                  onChange={() => handleRadioChange('yes')}
                  aria-describedby={validationError ? 'add-other-areas-error' : undefined}
                />
                <label className="govuk-label govuk-radios__label" htmlFor="add-other-areas-yes">
                  Yes
                </label>
              </div>

              {/* No Option */}
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="add-other-areas-no"
                  name="add-other-areas"
                  type="radio"
                  value="no"
                  checked={selectedOption === 'no'}
                  onChange={() => handleRadioChange('no')}
                  aria-describedby={validationError ? 'add-other-areas-error' : undefined}
                />
                <label className="govuk-label govuk-radios__label" htmlFor="add-other-areas-no">
                  No
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Action Buttons */}
        <div className="govuk-button-group">
          <button
            type="button"
            className="govuk-button"
            data-module="govuk-button"
            onClick={handleSaveAndContinue}
          >
            Save and continue
          </button>

          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
            onClick={handleSaveForLater}
          >
            Save for later
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOtherAreasQuestionPage;
