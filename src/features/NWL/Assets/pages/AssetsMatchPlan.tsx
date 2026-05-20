import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { useApplicationId, useAssetsData } from '../hooks';
import { BREADCRUMBS, LABELS, FORM_ERRORS, CHARACTER_LIMITS, MESSAGES } from '../constants';
import nwlAssetService from '../services/nwlAssetService';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('AssetsMatchPlan');

const AssetsMatchPlan: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useApplicationId();
  
  // Fetch existing assets data
  const { assetsData, loading } = useAssetsData(applicationId);
  
  const [assetsMatch, setAssetsMatch] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [errors, setErrors] = useState<{ assetsMatch?: string; explanation?: string; general?: string }>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing metadata when assetsData is available
  useEffect(() => {
    if (assetsData && !loading) {
      logger.debug('[AssetsMatchPlan] Loading existing metadata', {
        assetsMatchPlan: assetsData.assets_match_plan,
        hasExplanation: !!assetsData.assets_match_plan_explanation,
      });

      // Only set the value if metadata exists (not default false)
      if (assetsData.metadata_id) {
        setAssetsMatch(assetsData.assets_match_plan ? 'yes' : 'no');
        setExplanation(assetsData.assets_match_plan_explanation || '');
      }
    }
  }, [assetsData, loading]);

  const handleRadioChange = (value: string) => {
    setAssetsMatch(value);
    setErrors({ ...errors, assetsMatch: undefined });
    setShowErrorSummary(false);
    
    // Clear explanation if "Yes" is selected
    if (value === 'yes') {
      setExplanation('');
      setErrors({ ...errors, explanation: undefined });
    }
  };

  const handleExplanationChange = (value: string) => {
    // Enforce character limit
    const trimmedValue = value.slice(0, CHARACTER_LIMITS.MAX_DESCRIPTION);
    setExplanation(trimmedValue);
    setErrors({ ...errors, explanation: undefined });
    setShowErrorSummary(false);
  };

  const validateForm = (): boolean => {
    const newErrors: { assetsMatch?: string; explanation?: string } = {};

    if (!assetsMatch) {
      newErrors.assetsMatch = FORM_ERRORS.MISSING_ASSETS_MATCH;
    }

    if (assetsMatch === 'no' && !explanation.trim()) {
      newErrors.explanation = FORM_ERRORS.MISSING_EXPLANATION;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowErrorSummary(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Clear errors
    setErrors({});
    setShowErrorSummary(false);
    setSaving(true);

    try {
      logger.debug('[handleSubmit] Updating assets metadata', {
        applicationId,
        assetsMatch,
        hasExplanation: !!explanation,
      });

      // Save data to backend
      await nwlAssetService.updateMetadata(
        applicationId,
        assetsMatch === 'yes',
        assetsMatch === 'no' ? explanation : undefined
      );

      logger.info('[handleSubmit] Metadata updated successfully');

      // Navigate to task list
      navigate(`${NWL_BASE_URL}/${applicationId}/task-list`);
    } catch (error: unknown) {
      logger.error('[handleSubmit] Error updating metadata', { error });

      // Type guard for axios error
      interface AxiosError {
        response?: {
          data?: {
            details?: string;
            error?: string;
            message?: string;
          };
        };
      }

      const axiosError = error as AxiosError;
      const errorMessage =
        axiosError?.response?.data?.details ||
        axiosError?.response?.data?.error ||
        axiosError?.response?.data?.message ||
        'Failed to save. Please try again.';

      setErrors({ general: errorMessage });
      setShowErrorSummary(true);
    } finally {
      setSaving(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <main className="govuk-main-wrapper" id="main-content">
      {/* Breadcrumbs */}
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${NWL_BASE_URL}/${applicationId}/task-list`}
            >
              {BREADCRUMBS.TASK_LIST}
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            {BREADCRUMBS.ASSETS}
          </li>
        </ol>
      </nav>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          
          <h1 className="govuk-heading-xl">{LABELS.ASSETS_MATCH_PLAN_TITLE}</h1>

          {/* Loading State */}
          {loading && (
            <p className="govuk-body">Loading existing data...</p>
          )}

          {/* Error Summary */}
          {showErrorSummary && hasErrors && (
            <div
              className="govuk-error-summary"
              data-module="govuk-error-summary"
              tabIndex={-1}
              role="alert"
            >
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  {errors.general && (
                    <li>{errors.general}</li>
                  )}
                  {errors.assetsMatch && (
                    <li>
                      <a href="#assets-match">{errors.assetsMatch}</a>
                    </li>
                  )}
                  {errors.explanation && (
                    <li>
                      <a href="#explanation">{errors.explanation}</a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}


          <form noValidate>
            {/* Radio buttons */}
            <div
              className={`govuk-form-group ${errors.assetsMatch ? 'govuk-form-group--error' : ''}`}
            >
              <fieldset
                className="govuk-fieldset"
                aria-describedby={errors.assetsMatch ? 'assets-match-error' : undefined}
              >
                <legend className="govuk-fieldset__legend govuk-visually-hidden">
                  {LABELS.ASSETS_MATCH_PLAN_TITLE}
                </legend>

                {errors.assetsMatch && (
                  <p id="assets-match-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.assetsMatch}
                  </p>
                )}

                <div className="govuk-radios" data-module="govuk-radios">
                  {/* Yes Radio */}
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="assets-match"
                      name="assets-match"
                      type="radio"
                      value="yes"
                      checked={assetsMatch === 'yes'}
                      onChange={(e) => handleRadioChange(e.target.value)}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="assets-match">
                      {LABELS.YES}
                    </label>
                  </div>

                  {/* No Radio with conditional content */}
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="assets-match-2"
                      name="assets-match"
                      type="radio"
                      value="no"
                      checked={assetsMatch === 'no'}
                      onChange={(e) => handleRadioChange(e.target.value)}
                      aria-controls="conditional-assets-match-2"
                      aria-expanded={assetsMatch === 'no'}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="assets-match-2">
                      {LABELS.NO}
                    </label>
                  </div>

                  {/* Conditional textarea for "No" */}
                  {assetsMatch === 'no' && (
                    <div
                      className="govuk-radios__conditional"
                      id="conditional-assets-match-2"
                    >
                      <div
                        className={`govuk-form-group govuk-character-count ${
                          errors.explanation ? 'govuk-form-group--error' : ''
                        }`}
                        data-module="govuk-character-count"
                        data-maxlength={CHARACTER_LIMITS.MAX_DESCRIPTION}
                      >
                        <label className="govuk-label" htmlFor="explanation">
                          {LABELS.EXPLAIN_MISMATCH_LABEL}
                        </label>

                        {errors.explanation && (
                          <p id="explanation-error" className="govuk-error-message">
                            <span className="govuk-visually-hidden">Error:</span>{' '}
                            {errors.explanation}
                          </p>
                        )}

                        <textarea
                          className={`govuk-textarea govuk-js-character-count ${
                            errors.explanation ? 'govuk-textarea--error' : ''
                          }`}
                          id="explanation"
                          name="explanation"
                          rows={5}
                          value={explanation}
                          onChange={(e) => handleExplanationChange(e.target.value)}
                          maxLength={CHARACTER_LIMITS.MAX_DESCRIPTION}
                          aria-describedby={`${
                            errors.explanation ? 'explanation-error ' : ''
                          }explanation-info`}
                        />

                        <div
                          id="explanation-info"
                          className="govuk-hint govuk-character-count__message"
                        >
                          {MESSAGES.CHARACTER_REMAINING(
                            CHARACTER_LIMITS.MAX_DESCRIPTION - explanation.length
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </fieldset>
            </div>

            {/* Form Actions */}
            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving...' : LABELS.CONTINUE}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AssetsMatchPlan;
