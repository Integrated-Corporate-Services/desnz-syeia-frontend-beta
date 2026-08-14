import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { saveSensitiveReview } from '../../../services/sensitiveAreaService';
import { getSensitiveAreaReview } from '../../../services/sensitiveAreaReviewService';

/**
 * AddOtherAreasQuestionPage Component
 * 
 * Asks the user if they want to add any other sensitive areas that are not automatically checked.
 * 

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
  const [existingReview, setExistingReview] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // ===========================
  // VALIDATION LOGIC
  // ===========================
  // LocalStorage helpers
  const lsKey = (appId: string) => `sensitive_add_other_${appId}`;
  const readSavedOption = (appId: string): 'yes' | 'no' | null => {
    try {
      const v = localStorage.getItem(lsKey(appId));
      if (v === 'yes' || v === 'no') return v;
    } catch (e) {
      // ignore localStorage errors
    }
    return null;
  };
  const saveOption = (appId: string, option: 'yes' | 'no' | null) => {
    try {
      if (!option) {
        localStorage.removeItem(lsKey(appId));
      } else {
        localStorage.setItem(lsKey(appId), option);
      }
    } catch (e) {
      // ignore write errors
    }
  };

  // Pre-populate from localStorage first, fallback to server pre-fill
  useEffect(() => {
    if (!effectiveApplicationId) {
      setLoading(false);
      return;
    }

    const saved = readSavedOption(effectiveApplicationId);
    if (saved) {
      setSelectedOption(saved);
      setLoading(false);
      return;
    }


    let mounted = true;
    (async () => {
      try {
        const reviews = await getSensitiveAreaReview(effectiveApplicationId);
        if (!mounted) return;
        
        if (reviews && reviews.length > 0) {
          const latestReview = reviews[0];
          setExistingReview(latestReview);
          
          if (latestReview.add_other_areas_choice === 'yes' || latestReview.add_other_areas_choice === 'no') {
            setSelectedOption(latestReview.add_other_areas_choice);
          }
        }
      } catch (err) {
        // ignore â€” non-fatal for pre-fill
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [effectiveApplicationId]);
  
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
    if (effectiveApplicationId) saveOption(effectiveApplicationId, option);
  };

  /**
   * Handles "Save and continue" with validation
   */
  const handleSaveAndContinue = () => {
    if (!effectiveApplicationId) return;

    if (!validateForm()) return;

    saveOption(effectiveApplicationId, selectedOption);
    // Include id if updating existing review, otherwise create new
    const payload: any = {
      application_id: effectiveApplicationId,
      add_other_areas_choice: selectedOption
    };
    
    if (existingReview?.id) {
      payload.id = existingReview.id;
      payload.route_id = existingReview.route_id;
      payload.settings_id = existingReview.settings_id;
      payload.asset_presence_option_id = existingReview.asset_presence_option_id;
      payload.other_sensitive_areas_note = existingReview.other_sensitive_areas_note;
      payload.reviewed_by = existingReview.reviewed_by;
      payload.reviewed_at = existingReview.reviewed_at;
      payload.uploaded_files = existingReview.uploaded_files || [];
      payload.application_documents = existingReview.application_documents || [];
    }

    (async () => {
      try {
        await saveSensitiveReview(payload);
        saveOption(effectiveApplicationId, null);
      } catch (err) {
        // If save fails, keep local stash so user choice isn't lost; optionally surface error
        // For now we silently fallback to local stash
      } finally {
        if (selectedOption === 'yes') {
          navigate(`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-add-areas`);
        } else {
          navigate(`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-review/poles`);
        }
      }
    })();
  };

  /**
   * Handles "Save for later" without validation
   */
  // const handleSaveForLater = () => {
  //   if (!effectiveApplicationId) return;

  //   // Save partial progress and return to task list
  //   navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
  // };

  // ===========================
  // RENDER
  // ===========================
  
  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="govuk-width-container">
                  <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <p className="govuk-body">Loading...</p>
            </div>
          </div>
              </div>
    );
  }

  return (
    <>
            <div className="govuk-width-container">
      {/* Back Link - Always visible */}
      <Link 
        to={`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-review-manual`} 
        className="govuk-back-link"
      >
        Back
      </Link>

      {/* Page Heading - Three-quarters width */}
      <div className='govuk-grid-row'>
        <div className="govuk-grid-column-three-quarters">
          <h1 className="govuk-heading-l govuk-!-margin-top-2 govuk-!-margin-bottom-2">
            Do you want to add any other sensitive areas?
          </h1>
          <div className="govuk-hint">
            These should only be any areas that are not automatically checked.
          </div>
        </div>
      </div>

      {/* Main Content Area - Two-thirds width */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">

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
              {/* <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                <h2 className="govuk-fieldset__heading">
                  Select an option
                </h2>
              </legend> */}

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
          <button
            type="button"
            className="govuk-button"
            data-module="govuk-button"
            onClick={handleSaveAndContinue}
          >
            Save and continue
          </button>
          {/* <button
            type="button"
            className="govuk-button govuk-button--secondary govuk-!-margin-left-3"
            data-module="govuk-button"
            onClick={handleSaveForLater}
          >
            Save for later
          </button> */}
        </div>
      </div>
      </div>
    </>
  );
};

export default AddOtherAreasQuestionPage;
