import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getSensitiveAreaReviewSummary, SensitiveAreaReviewSummary, LayerCheckItem } from '../../../services/sensitiveAreaService';
import { S37_BASE_URL } from '../../../constants/s37';

/**
 * ReviewSensitiveAreaResultsPage Component

 */
const ReviewSensitiveAreaResultsPage: React.FC = () => {
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

  // ===========================
  // DATA FETCHING
  // ===========================
  useEffect(() => {
    if (!effectiveApplicationId) return;

    setLoading(true);
    setError(null);

    let pollInterval: number | null = null;

    const fetchSummary = async () => {
      try {
        const data = await getSensitiveAreaReviewSummary(effectiveApplicationId);
        
        setChecksSummary(data);

        // Check if all automated checks are complete
        const { totalChecked, totalLayers } = data.checks.summary;
        
        if (totalChecked < totalLayers) {
          // Still processing, keep polling every 2 seconds
          if (!pollInterval) {
            pollInterval = setInterval(fetchSummary, 2000);
          }
        } else {
          // All checks complete, stop polling
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
          setLoading(false);
        }
      } catch {
        setError('Failed to fetch sensitive area review summary');
        setLoading(false);
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }
    };

    fetchSummary();

    // Cleanup on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [effectiveApplicationId]);

  // ===========================
  // HELPER FUNCTIONS
  // ===========================

  const getLayerCategories = () => {
    if (!checksSummary) return null;

    const { checks } = checksSummary;

    return {
      passedAreasScreening: checks.automated.passed.screeningRequired || [],
      passedAreasNoScreening: checks.automated.passed.noScreening || [],
      failedAreas: [
        ...(checks.automated.failed.screeningRequired || []),
        ...(checks.automated.failed.noScreening || [])
      ]
    };
  };

 
  const hasFailedChecks = (): boolean => {
    if (!checksSummary) return false;
    const { checks } = checksSummary;
    return (
      (checks.automated.failed.screeningRequired?.length || 0) > 0 ||
      (checks.automated.failed.noScreening?.length || 0) > 0
    );
  };

 
  const hasExcessiveFailures = (): boolean => {
    if (!checksSummary) return false;
    const { checks } = checksSummary;
    const totalFailed = 
      (checks.automated.failed.screeningRequired?.length || 0) +
      (checks.automated.failed.noScreening?.length || 0);
    return totalFailed > 10;
  };


  const getSuccessfulCheckCount = (): number => {
    if (!checksSummary) return 0;
    const { checks } = checksSummary;
    return (
      (checks.automated.passed.screeningRequired?.length || 0) +
      (checks.automated.passed.noScreening?.length || 0) +
      (checks.automated.cleared.screeningRequired?.length || 0) +
      (checks.automated.cleared.noScreening?.length || 0)
    );
  };

 
  const handleSaveAndContinue = async () => {
    if (!effectiveApplicationId) return;

    // No need to save on this page - just navigate
    // The review will be saved on subsequent pages (Poles, Documents)
    if (hasFailedChecks()) {
      navigate(`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-review-manual`);
    } else {
      navigate(`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-review/add-areas`);
    }
  };

  /**
   * Handles "Save for later"
   */
  // const handleSaveForLater = async () => {
  //   if (!effectiveApplicationId) return;

  //   try {
  //     await saveReview({
  //       application_id: effectiveApplicationId
  //     });
  //     navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
  //   } catch (err) {
  //     console.error('Failed to save for later:', err);
  //     setError('Failed to save your progress. Please try again.');
  //   }
  // };

  // ===========================
  // RENDER: CONSISTENT WRAPPER WITH CONDITIONAL CONTENT
  // ===========================
  
  const layerCategories = getLayerCategories();
  const { passedAreasScreening, passedAreasNoScreening, failedAreas } = layerCategories || {
    passedAreasScreening: [],
    passedAreasNoScreening: [],
    failedAreas: []
  };

  return (
    <div className="govuk-width-container">
      {/* Breadcrumb Navigation - Always visible */}
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${effectiveApplicationId}/task-list`}>
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Sensitive area review</li>
        </ol>
      </nav>

      {/* Main Content Area */}
      <div className='govuk-grid-row'>
        <div className="govuk-grid-column-two-thirds">
          {/* Page Heading - Always visible */}
          <h1 className="govuk-heading-l govuk-!-margin-top-2 govuk-!-margin-bottom-2">Sensitive area review</h1>

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
          ) : hasExcessiveFailures() ? (
            // Excessive Failures Scenario (11+ failed)
            <>
              {/* Inset Text - Error Message */}
              <div className="govuk-inset-text">
                We could not complete all the sensitive area checks.
              </div>

              {/* Next Steps Subheading */}
              <h2 className="govuk-heading-m">Next steps</h2>

              {/* Instructions - Wait 24 hours */}
              <p className="govuk-body">
                Please wait at least 24 hours and run the sensitive area checks again.
              </p>

              {/* Instructions - Contact team */}
              <p className="govuk-body">
                Contact our team at{' '}
                <a 
                  href="mailto:37consents@energysecurity.gov.uk" 
                  className="govuk-link"
                  aria-label="Email the S37 consents team"
                >
                  37consents@energysecurity.gov.uk
                </a>
                {' '}if the checks are still not successful after 24 hours.
              </p>

              {/* Return to Task List Link */}
              <p className="govuk-body">
                <Link
                  to={`${S37_BASE_URL}/${effectiveApplicationId}/task-list`}
                  className="govuk-link"
                >
                  Return to task list
                </Link>
              </p>
            </>
          ) : (
            // Success/Partial Success Scenario (0-10 failed)
            <>
              {/* Summary Message with Dynamic Counts - Excludes FAILED layers */}
              <p className="govuk-body">
                The check was successfully performed on {getSuccessfulCheckCount()} of {checksSummary.checks.summary.totalLayers} sensitive areas.
              </p>

              {/* Screening Required Message */}
              {passedAreasScreening.length > 0 && (
                <>
                  <p className="govuk-body">
                    Your route passes through these areas and requires an environmental impact assessment screening. 
                    This will add a charge of £600.00 to your application fee:
                  </p>
                  <ul className="govuk-list govuk-list--bullet">
                    {passedAreasScreening.map((layer: LayerCheckItem) => (
                      <li key={layer.layerId}>{layer.layerName}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* No Screening Required Message */}
              {passedAreasNoScreening.length > 0 && (
                <>
                  <p className="govuk-body">
                    It also passes through these areas which do not require screening:
                  </p>
                  <ul className="govuk-list govuk-list--bullet">
                    {passedAreasNoScreening.map((layer: LayerCheckItem) => (
                      <li key={layer.layerId}>{layer.layerName}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* Failed/Unchecked Areas Section - Only show if there are failed checks (1-10) */}
              {hasFailedChecks() && failedAreas.length > 0 && (
                <>
                  <h2 className="govuk-heading-m">We could not check these areas</h2>
                  <ul className="govuk-list govuk-list--bullet">
                    {failedAreas.map((layer: LayerCheckItem) => (
                      <li key={layer.layerId}>{layer.layerName}</li>
                    ))}
                  </ul>
                </>
              )}

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

export default ReviewSensitiveAreaResultsPage;