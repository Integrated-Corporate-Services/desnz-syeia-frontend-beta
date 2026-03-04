import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SensitiveAreaPoleOption } from '../../../types/SensitiveAreaPoleOption';
import { useSensitiveAreaReview } from '../../../store/sensitiveAreaReviewStore';
import { S37_BASE_URL } from '../../../constants/s37';

const ReviewPolesPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [poleOption, setPoleOption] = useState<SensitiveAreaPoleOption | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Use the store hook (consistent with SensitiveAreaReviewPage)
  const {
    review,
    loading,
    error: reviewError,
    fetchReview,
    saveReview
  } = useSensitiveAreaReview(applicationId || '');

  // Fetch existing review data on mount
  useEffect(() => {
    if (!applicationId) return;
    fetchReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  // Pre-populate pole option when review loads
  useEffect(() => {
    if (review?.asset_presence_option_id) {
      setPoleOption(review.asset_presence_option_id as SensitiveAreaPoleOption);
    }
  }, [review]);

  // Validation function
  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (poleOption === null) {
      errors.push('Select whether there are poles or overhead lines within the sensitive areas');
    }

    return errors;
  };

  // Save handler
  const handleSaveReview = async (saveType: 'continue' | 'later' = 'continue') => {
    setFormErrors([]);
    setApiError(null);

    // Validate only on 'continue'
    if (saveType === 'continue') {
      const errors = validateForm();
      if (errors.length > 0) {
        setFormErrors(errors);
        // Scroll to error summary
        document.getElementById('error-summary')?.focus();
        return;
      }
    }

    // Build payload - preserve all existing data (consistent with SensitiveAreaReviewPage)
    const payload = {
      id: review?.id || '',
      application_id: applicationId || '',
      route_id: review?.route_id || '',
      settings_id: review?.settings_id || '',
      asset_presence_option_id: poleOption ?? undefined,
      other_sensitive_areas_note: review?.other_sensitive_areas_note || '',
      add_other_areas_choice: review?.add_other_areas_choice || null,
      reviewed_by: review?.reviewed_by || '',
      reviewed_at: review?.reviewed_at || '',
      created_at: review?.created_at || '',
      updated_at: review?.updated_at || '',
      uploaded_files: review?.uploaded_files || [],
      application_documents: review?.application_documents || [],
    };

    try {
      await saveReview(payload);

      // Navigate based on save type
      if (saveType === 'continue') {
        navigate(`${S37_BASE_URL}/${applicationId}/sensitive-area-review/documents`);
      } else {
        navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save review';
      setApiError(errorMessage);
      setFormErrors(['There was a problem saving your data. Please try again.']);
    }
  };

  if (loading && !review) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <p className="govuk-body">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      {/* Back link */}
      <Link 
        to={`${S37_BASE_URL}/${applicationId}/sensitive-area-review/add-areas`}
        className="govuk-back-link"
      >
        Back
      </Link>

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {/* Error Summary */}
            {formErrors.length > 0 && (
              <div
                id="error-summary"
                className="govuk-error-summary"
                aria-labelledby="error-summary-title"
                role="alert"
                tabIndex={-1}
                data-module="govuk-error-summary"
              >
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    {formErrors.map((error, index) => (
                      <li key={index}>
                        <a href="#pole-radio-group">{error}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* API Error or Store Error */}
            {(apiError || reviewError) && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">Error</h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body">{apiError || reviewError}</p>
                </div>
              </div>
            )}

            {/* Page Heading */}
            <h1 className="govuk-heading-l">
              Are there any poles or overhead lines in the sensitive areas?
            </h1>

            {/* Radio Group */}
            <div
              id="pole-radio-group"
              className={`govuk-form-group${
                formErrors.some((err) =>
                  err.includes('poles or overhead lines')
                )
                  ? ' govuk-form-group--error'
                  : ''
              }`}
            >
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m govuk-visually-hidden">
                  Select an option
                </legend>

                {/* Inline error message */}
                {formErrors.some((err) =>
                  err.includes('poles or overhead lines')
                ) && (
                  <span id="pole-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>
                    Select whether there are poles or overhead lines within the sensitive areas
                  </span>
                )}

                <div className="govuk-radios" data-module="govuk-radios">
                  {/* Option 1: Poles within */}
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="pole-option-1"
                      name="poleOption"
                      type="radio"
                      value={SensitiveAreaPoleOption.POLES_WITHIN}
                      checked={poleOption === SensitiveAreaPoleOption.POLES_WITHIN}
                      onChange={() => {
                        setPoleOption(SensitiveAreaPoleOption.POLES_WITHIN);
                        setFormErrors([]);
                      }}
                      aria-describedby={formErrors.length > 0 ? 'pole-error' : undefined}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="pole-option-1">
                      Yes, there are poles in the sensitive areas
                    </label>
                  </div>

                  {/* Option 2: Only overhead lines */}
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="pole-option-2"
                      name="poleOption"
                      type="radio"
                      value={SensitiveAreaPoleOption.ONLY_OVERHEAD}
                      checked={poleOption === SensitiveAreaPoleOption.ONLY_OVERHEAD}
                      onChange={() => {
                        setPoleOption(SensitiveAreaPoleOption.ONLY_OVERHEAD);
                        setFormErrors([]);
                      }}
                      aria-describedby={formErrors.length > 0 ? 'pole-error' : undefined}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="pole-option-2">
                      Only overhead lines pass through (all poles are outside)
                    </label>
                  </div>

                  {/* Option 3: No poles within */}
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="pole-option-3"
                      name="poleOption"
                      type="radio"
                      value={SensitiveAreaPoleOption.NO_POLES_WITHIN}
                      checked={poleOption === SensitiveAreaPoleOption.NO_POLES_WITHIN}
                      onChange={() => {
                        setPoleOption(SensitiveAreaPoleOption.NO_POLES_WITHIN);
                        setFormErrors([]);
                      }}
                      aria-describedby={formErrors.length > 0 ? 'pole-error' : undefined}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="pole-option-3">
                      No, there are no poles or overhead lines
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* Buttons */}
            <div className="govuk-button-group">
              <button
                className="govuk-button"
                data-module="govuk-button"
                onClick={() => handleSaveReview('continue')}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save and continue'}
              </button>

              {/* <button
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={() => handleSaveReview('later')}
                disabled={loading}
              >
                Save for later
              </button> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewPolesPage;
