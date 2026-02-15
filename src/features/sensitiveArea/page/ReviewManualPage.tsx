import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getSensitiveAreaReviewSummary, SensitiveAreaReviewSummary, LayerCheckItem, updateManuallySelectedLayers } from '../../../services/sensitiveAreaService';
import { S37_BASE_URL } from '../../../constants/s37';

/**
 * ReviewManualPage Component
 * 
 * Allows applicants to manually review and confirm failed sensitive area checks.
 * Displays up to 10 failed layers with checkboxes for manual verification.
 * Includes links to MAGIC and DataMapWales mapping tools.
 * 
 * User Story: As an applicant, I want to be informed if a sensitive area check has failed 
 * so that I can take further action to resolve the issue.
 */
const ReviewManualPage: React.FC = () => {
  // ===========================
  // HOOKS & STATE MANAGEMENT
  // ===========================
  const { applicationId } = useParams<{ applicationId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');
  const effectiveApplicationId = applicationId || queryId || '';

  // API Data State
  const [checksSummary, setChecksSummary] = useState<SensitiveAreaReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedFailedLayers, setSelectedFailedLayers] = useState<Record<number, boolean>>({});
  const [noneSelected, setNoneSelected] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ===========================
  // DATA FETCHING
  // ===========================
  useEffect(() => {
    if (!effectiveApplicationId) return;

    setLoading(true);
    setError(null);

    getSensitiveAreaReviewSummary(effectiveApplicationId)
      .then(data => {
        setChecksSummary(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch sensitive area review summary');
        setLoading(false);
      });
  }, [effectiveApplicationId]);

  // ===========================
  // HELPER FUNCTIONS
  // ===========================

  /**
   * Gets list of failed layers (up to 10)
   */
  const getFailedLayers = (): LayerCheckItem[] => {
    if (!checksSummary) return [];

    const { checks } = checksSummary;
    const failedLayers = [
      ...(checks.automated.failed.screeningRequired || []),
      ...(checks.automated.failed.noScreening || [])
    ];

    // Limit to 10 layers as per AC
    return failedLayers.slice(0, 10);
  };

  /**
   * Validates form inputs before save
   */
  const validateForm = (): boolean => {
    const hasSelectedAny = Object.values(selectedFailedLayers).some(v => v);
    
    if (!hasSelectedAny && !noneSelected) {
      setValidationError('Please select at least one area or confirm that your route does not pass through any of these areas');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    setValidationError(null);
    return true;
  };

  // ===========================
  // EVENT HANDLERS
  // ===========================

  /**
   * Handles checkbox toggle for failed layers
   */
  const handleLayerToggle = (layerId: number) => {
    setSelectedFailedLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
    
    // If a layer is selected, uncheck "None" option
    if (!selectedFailedLayers[layerId]) {
      setNoneSelected(false);
    }
  };

  /**
   * Handles "None" checkbox toggle
   */
  const handleNoneToggle = () => {
    setNoneSelected(!noneSelected);
    
    // If "None" is selected, uncheck all layers
    if (!noneSelected) {
      setSelectedFailedLayers({});
    }
  };

  /**
   * Handles "Save and continue" with validation
   */
  const handleSaveAndContinue = async () => {
    if (!effectiveApplicationId) return;

    if (!validateForm()) return;

    try {
      // Save the manual review selections using POST endpoint
      const selectedLayerIds = Object.keys(selectedFailedLayers)
        .filter(id => selectedFailedLayers[Number(id)])
        .map(Number);
      
      await updateManuallySelectedLayers(
        effectiveApplicationId,
        selectedLayerIds,
        noneSelected
      );
      
      // Navigate to next page: AddOtherAreasQuestionPage
      navigate(`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-add-question`);
    } catch (err) {
      console.error('Failed to save review:', err);
      setError('Failed to save your review. Please try again.');
    }
  };

  /**
   * Handles "Save for later" without validation
   */
  // const handleSaveForLater = async () => {
  //   if (!effectiveApplicationId) return;

  //   try {
  //     // Save partial progress using POST endpoint
  //     const selectedLayerIds = Object.keys(selectedFailedLayers)
  //       .filter(id => selectedFailedLayers[Number(id)])
  //       .map(Number);
      
  //     await updateManuallySelectedLayers(
  //       effectiveApplicationId,
  //       selectedLayerIds,
  //       noneSelected
  //     );
      
  //     navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
  //   } catch (err) {
  //     console.error('Failed to save for later:', err);
  //     setError('Failed to save your progress. Please try again.');
  //   }
  // };

  // ===========================
  // RENDER: CONSISTENT WRAPPER WITH CONDITIONAL CONTENT
  // ===========================

  const failedLayers = getFailedLayers();

  return (
    <div className="govuk-width-container">
      {/* Back Link - Always visible */}
      <Link 
        to={`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-review`} 
        className="govuk-back-link"
      >
        Back
      </Link>

      {/* Page Heading - Three-quarters width */}
      <div className='govuk-grid-row'>
        <div className="govuk-grid-column-three-quarters">
          <h1 className="govuk-heading-l govuk-!-margin-top-2">Review the areas we could not check</h1>
        </div>
      </div>

      {/* Main Content Area - Two-thirds width */}
      <div className='govuk-grid-row'>
        <div className="govuk-grid-column-two-thirds">
          {/* CONDITIONAL CONTENT RENDERING */}
          {loading ? (
            // Loading State
            <div>Loading sensitive areas...</div>
          ) : error ? (
            // Error State
            <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title" tabIndex={-1}>
              <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <p>{error}</p>
              </div>
            </div>
          ) : !checksSummary ? (
            // No data state
            <div>No data available</div>
          ) : failedLayers.length === 0 ? (
            // No failed layers - redirect (but show message briefly)
            <>
              <p className="govuk-body">No failed areas to review. Redirecting...</p>
              {navigate(`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-review`)}
            </>
          ) : (
            // Main Content - Failed Layers Review
            <>
              {/* Validation Error Summary */}
              {validationError && (
                <div
                  className="govuk-error-summary"
                  aria-labelledby="error-summary-title"
                  role="alert"
                  data-module="govuk-error-summary"
                >
                  <h2 className="govuk-error-summary__title" id="error-summary-title">
                    There is a problem
                  </h2>
                  <div className="govuk-error-summary__body">
                    <ul className="govuk-list govuk-error-summary__list">
                      <li>
                        <a href="#failed-areas">{validationError}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Instructions Paragraph */}
              <p className="govuk-body">
                You can use these tools to check if your route passes through any sensitive areas we could not check:
              </p>

              {/* Mapping Tools List */}
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <a
                    href="https://magic.defra.gov.uk/MagicMap.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="govuk-link"
                  >
                    MAGIC (opens in a new tab)
                  </a>
                </li>
                <li>
                  <a
                    href="https://datamap.gov.wales/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="govuk-link"
                  >
                    DataMapWales (opens in a new tab)
                  </a>
                </li>
              </ul>

              {/* Failed Areas Checkboxes */}
              <div className="govuk-form-group" id="failed-areas">
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h4 className="govuk-fieldset__heading">
                      Does your route pass through any of these areas?
                    </h4>
                  </legend>
                  <div className="govuk-hint">
                    Select all areas that apply
                  </div>

                  <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                    {/* Failed Layer Checkboxes */}
                    {failedLayers.map(layer => (
                      <div key={layer.layerId} className="govuk-checkboxes__item">
                        <input
                          className="govuk-checkboxes__input"
                          id={`failed-layer-${layer.layerId}`}
                          name="failedLayers"
                          type="checkbox"
                          value={layer.layerId}
                          checked={selectedFailedLayers[layer.layerId] || false}
                          onChange={() => handleLayerToggle(layer.layerId)}
                          disabled={noneSelected}
                        />
                        <label
                          className="govuk-label govuk-checkboxes__label"
                          htmlFor={`failed-layer-${layer.layerId}`}
                        >
                          {layer.layerName}
                        </label>
                      </div>
                    ))}

                    {/* Divider */}
                    <div className="govuk-checkboxes__divider">Or</div>

                    {/* None Option */}
                    <div className="govuk-checkboxes__item">
                      <input
                        className="govuk-checkboxes__input"
                        id="none-selected"
                        name="noneSelected"
                        type="checkbox"
                        checked={noneSelected}
                        onChange={handleNoneToggle}
                      />
                      <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor="none-selected"
                      >
                        No, my route does not pass through any of these areas
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
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReviewManualPage;
