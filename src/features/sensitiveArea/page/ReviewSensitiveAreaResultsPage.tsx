import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getSensitiveAreaReviewSummary, SensitiveAreaReviewSummary, LayerCheckItem } from '../../../services/sensitiveAreaService';
import { useSensitiveAreaReview } from '../../../store/sensitiveAreaReviewStore';
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

  // Access review store for save functionality
  const { saveReview } = useSensitiveAreaReview(effectiveApplicationId);

  // ===========================
  // DATA FETCHING
  // ===========================
  useEffect(() => {
    if (!effectiveApplicationId) return;

    setLoading(true);
    setError(null);

    getSensitiveAreaReviewSummary(effectiveApplicationId)
      .then(data => {
        // console.log('=== SENSITIVE AREA REVIEW SUMMARY ===');
        // console.log('Full API Response:', data);
        // console.log('Passed (INTERSECT) - Screening Required:', data?.checks?.automated?.passed?.screeningRequired?.length || 0);
        // console.log('Passed (INTERSECT) - No Screening:', data?.checks?.automated?.passed?.noScreening?.length || 0);
        // console.log('Cleared (NO_INTERSECT) - Screening Required:', data?.checks?.automated?.cleared?.screeningRequired?.length || 0);
        // console.log('Cleared (NO_INTERSECT) - No Screening:', data?.checks?.automated?.cleared?.noScreening?.length || 0);
        // console.log('Failed - Screening Required:', data?.checks?.automated?.failed?.screeningRequired?.length || 0);
        // console.log('Failed - No Screening:', data?.checks?.automated?.failed?.noScreening?.length || 0);
         const successCount = 
          (data?.checks?.automated?.passed?.screeningRequired?.length || 0) +
          (data?.checks?.automated?.passed?.noScreening?.length || 0) +
          (data?.checks?.automated?.cleared?.screeningRequired?.length || 0) +
          (data?.checks?.automated?.cleared?.noScreening?.length || 0);
        const totalFailed = 
          (data?.checks?.automated?.failed?.screeningRequired?.length || 0) + 
          (data?.checks?.automated?.failed?.noScreening?.length || 0);
        
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

    try {
      await saveReview({
        application_id: effectiveApplicationId
      });
      
        if (hasFailedChecks()) {
        navigate(`${S37_BASE_URL}/${effectiveApplicationId}/sensitive-area-review-manual`);
      } else {
        navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
      }
    } catch (err) {
      console.error('Failed to save review:', err);
      setError('Failed to save your review. Please try again.');
    }
  };

  /**
   * Handles "Save for later"
   */
  const handleSaveForLater = async () => {
    if (!effectiveApplicationId) return;

    try {
      await saveReview({
        application_id: effectiveApplicationId
      });
      navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
    } catch (err) {
      console.error('Failed to save for later:', err);
      setError('Failed to save your progress. Please try again.');
    }
  };

  // ===========================
  // RENDER: LOADING & ERROR STATES
  // ===========================
  if (loading) {
    return (
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Sensitive area review</h1>
          <p className="govuk-body">Loading sensitive area check results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Sensitive area review</h1>
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // RENDER: MAIN CONTENT
  // ===========================
  if (!checksSummary) return null;


  if (hasExcessiveFailures()) {
    return (
      <div className="govuk-width-container">
        {/* Breadcrumb Navigation */}
        <div className="govuk-breadcrumbs">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <a
                className="govuk-breadcrumbs__link"
                href={`${S37_BASE_URL}/${effectiveApplicationId}/task-list`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
                }}
              >
                Task list
              </a>
            </li>
            <li className="govuk-breadcrumbs__list-item">
              Sensitive area review
            </li>
          </ol>
        </div>

        <main className="govuk-main-wrapper">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              {/* Page Title */}
              <h1 className="govuk-heading-l">Sensitive area review</h1>

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
                <a
                  href={`${S37_BASE_URL}/${effectiveApplicationId}/task-list`}
                  className="govuk-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
                  }}
                >
                  Return to task list
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const layerCategories = getLayerCategories();
  if (!layerCategories) return null;

  const { passedAreasScreening, passedAreasNoScreening, failedAreas } = layerCategories;

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        {/* Page Heading */}
        <h1 className="govuk-heading-xl">Sensitive area review</h1>

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

        {/* Failed/Unchecked Areas Section - Only show if there are failed checks */}
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
        <div className="govuk-button-group">
          <button
            type="submit"
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

export default ReviewSensitiveAreaResultsPage;
