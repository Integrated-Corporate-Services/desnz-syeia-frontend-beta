import React, { useEffect, useState, useRef } from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { Link } from 'react-router-dom';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSensitiveAreaReviewSummary, SensitiveAreaReviewSummary } from '../../../services/sensitiveAreaService';
import { useSensitiveAreaReview } from '../../../store/sensitiveAreaReviewStore';
import { SensitiveAreaPoleOption } from '../../../types/SensitiveAreaPoleOption';
import { SENSITIVE_AREA_ERRORS } from '../../../constants/sensitiveAreaError';

const SensitiveAreaReviewPage: React.FC = () => {
  // Get applicationId from URL params or query string
  const { applicationId } = useParams<{ applicationId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');
  const effectiveApplicationId = applicationId || queryId || '';

  const [checksSummary, setChecksSummary] = useState<SensitiveAreaReviewSummary | null>(null);
  const [selectedFailedLayers, setSelectedFailedLayers] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherAreas, setOtherAreas] = useState('');
  const [poleOption, setPoleOption] = useState<SensitiveAreaPoleOption | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const navigate = useNavigate();

  // Sensitive area review store
  const {
    review,
    loading: reviewLoading,
    error: reviewError,
    fetchReview,
    saveReview
  } = useSensitiveAreaReview(effectiveApplicationId);

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
        setError(SENSITIVE_AREA_ERRORS.FETCH_SENSITIVE_AREAS_FAILED);
        setLoading(false);
      });
    // Fetch sensitive area review data
    fetchReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveApplicationId]);

  // Bind review data to form if available
  useEffect(() => {
    if (review) {
      setOtherAreas(review.other_sensitive_areas_note || '');
      setPoleOption(
        typeof review.asset_presence_option_id === 'number'
          ? review.asset_presence_option_id
          : review.asset_presence_option_id !== undefined
            ? Number(review.asset_presence_option_id)
            : null
      );
      // Load previously uploaded files and documents if present
      if (Array.isArray(review.uploaded_files)) {
        setUploadedFiles(review.uploaded_files);
      }
      if (Array.isArray(review.application_documents)) {
        setApplicationDocuments(review.application_documents);
      }
    }
  }, [review]);

  // Save handler for review
  const handleSaveReview = async (saveType: 'continue' | 'later' = 'continue') => {
    setFormErrors([]);
    setApiError(null);
    
    // Trigger file upload first if there are pending files (deferred upload pattern)
    let newlyUploadedFiles: UploadedFile[] = [];
    let newlyUploadedDocuments: ApplicationDocument[] = [];
    
    if (fileUploadRef.current && pendingFiles.length > 0) {
      try {
        const result = await fileUploadRef.current.triggerUpload();
        newlyUploadedFiles = result.uploadedFiles;
        newlyUploadedDocuments = result.applicationDocuments;
      } catch (err: any) {
        setApiError(SENSITIVE_AREA_ERRORS.FILE_UPLOAD_FAILED);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
    const errors: string[] = [];
    
    // Validation only for "continue" action
    if (saveType === 'continue') {
      // Validation: require at least one document
      const totalFiles = (uploadedFiles?.length || 0) + newlyUploadedFiles.length + pendingFiles.length;
      if (totalFiles === 0) {
        errors.push(SENSITIVE_AREA_ERRORS.UPLOAD_AT_LEAST_ONE_DOCUMENT);
      }
      if (poleOption === null) {
        errors.push(SENSITIVE_AREA_ERRORS.SELECT_POLE_OPTION);
      }
      
      // Validate failed areas checkboxes if there are failed areas
      const failedAreas = [
        ...(checksSummary?.checks?.automated?.failed?.screeningRequired || []),
        ...(checksSummary?.checks?.automated?.failed?.noScreening || [])
      ];
      if (failedAreas.length > 0) {
        const hasSelectedAtLeastOne = Object.values(selectedFailedLayers).some(v => v);
        if (!hasSelectedAtLeastOne) {
          errors.push(SENSITIVE_AREA_ERRORS.CONFIRM_FAILED_AREAS);
        }
      }
    }
    
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const payload = {
      id: review?.id || '',
      application_id: effectiveApplicationId,
      route_id: review?.route_id || '',
      settings_id: review?.settings_id || '',
      asset_presence_option_id: poleOption ?? undefined,
      other_sensitive_areas_note: otherAreas,
      reviewed_by: review?.reviewed_by || '',
      reviewed_at: review?.reviewed_at || '',
      created_at: review?.created_at || '',
      updated_at: review?.updated_at || '',
      uploaded_files: [...uploadedFiles, ...newlyUploadedFiles],
      application_documents: [...applicationDocuments, ...newlyUploadedDocuments],
    };
    try {
      await saveReview(payload);
      if (saveType === 'continue') {
        navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
      } else {
        navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : SENSITIVE_AREA_ERRORS.SAVE_REVIEW_FAILED;
      setApiError(errorMessage);
    }
  };

  const handleFailedLayerToggle = (layerId: number) => {
    setSelectedFailedLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  // Extract areas for display
  const passedAreasScreening = checksSummary?.checks?.automated?.passed?.screeningRequired || [];
  const passedAreasNoScreening = checksSummary?.checks?.automated?.passed?.noScreening || [];
  const failedAreasScreening = checksSummary?.checks?.automated?.failed?.screeningRequired || [];
  const failedAreasNoScreening = checksSummary?.checks?.automated?.failed?.noScreening || [];
  const clearedAreas = [
    ...(checksSummary?.checks?.automated?.cleared?.screeningRequired || []),
    ...(checksSummary?.checks?.automated?.cleared?.noScreening || [])
  ];
  
  const allFailedAreas = [...failedAreasScreening, ...failedAreasNoScreening];
  const allPassedAreas = [...passedAreasScreening, ...passedAreasNoScreening];
  const hasAnyFailedAreas = allFailedAreas.length > 0;

  return (
    <div className="govuk-width-container">
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
      <div className='govuk-grid-row'>
        <div className="govuk-grid-column-two-thirds">
      <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Sensitive area review</h1>
      {(loading || reviewLoading) ? (
        <div>Loading sensitive areas...</div>
      ) : (
        <>
          {(error || reviewError) && <div className="govuk-error-message">{error || reviewError}</div>}
          {(apiError || formErrors.length > 0) && (
            <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title" tabIndex={-1}>
              <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
              <ul className="govuk-list govuk-error-summary__list">
                {formErrors.map((err, idx) => {
                  let href = "#";
                  if (err === SENSITIVE_AREA_ERRORS.UPLOAD_AT_LEAST_ONE_DOCUMENT) href = '#document-upload';
                  if (err === SENSITIVE_AREA_ERRORS.SELECT_POLE_OPTION) href = '#pole-radio-group';
                  if (err === SENSITIVE_AREA_ERRORS.CONFIRM_FAILED_AREAS) href = '#failed-areas-checkboxes';
                  return <li key={idx}><a href={href}>{err}</a></li>;
                })}
                {apiError && <li><a href="#">{apiError}</a></li>}
              </ul>
            </div>
          )}

          {/* Passed Areas - Screening Required */}
          {passedAreasScreening.length > 0 && (
            <div className="govuk-!-margin-bottom-6" style={{ padding: '20px', backgroundColor: '#f3f2f1', border: '5px solid #00703c' }}>
              <h2 className="govuk-heading-m" style={{ marginTop: 0 }}>
                The following sensitive areas passed the checks and require screening:
              </h2>
              <ul className="govuk-list govuk-list--bullet">
                {passedAreasScreening.map((area) => (
                  <li key={area.layerId}>{area.layerName}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Passed Areas - No Screening Required */}
          {passedAreasNoScreening.length > 0 && (
            <div className="govuk-!-margin-bottom-6" style={{ padding: '20px', backgroundColor: '#f3f2f1', border: '5px solid #00703c' }}>
              <h2 className="govuk-heading-m" style={{ marginTop: 0 }}>
                The route passes through the following sensitive areas:
              </h2>
              <ul className="govuk-list govuk-list--bullet">
                {passedAreasNoScreening.map((area) => (
                  <li key={area.layerId}>{area.layerName}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Failed Areas Section */}
          {hasAnyFailedAreas && (
            <div 
              id="failed-areas-section" 
              className="govuk-!-margin-bottom-6" 
              style={{ padding: '20px', backgroundColor: '#fff8e6', border: '5px solid #d4351c' }}
            >
              <h2 className="govuk-heading-m" style={{ marginTop: 0, color: '#d4351c' }}>
                Sensitive area checks failed
              </h2>
              <p className="govuk-body">
                We could not automatically check whether your route passes through the following sensitive areas (up to {allFailedAreas.length} areas).
              </p>
              <p className="govuk-body">
                Please use{' '}
                <a 
                  href="https://magic.defra.gov.uk/MagicMap.aspx" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="govuk-link"
                  aria-label="MAGIC map (opens in new tab)"
                >
                  MAGIC
                </a>
                {' '}or{' '}
                <a 
                  href="https://datamap.gov.wales/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="govuk-link"
                  aria-label="DataMapWales (opens in new tab)"
                >
                  DataMapWales
                </a>
                {' '}to manually verify if your route passes through any of these areas.
              </p>

              <div 
                id="failed-areas-checkboxes" 
                className={`govuk-form-group${formErrors.includes(SENSITIVE_AREA_ERRORS.CONFIRM_FAILED_AREAS) ? ' govuk-form-group--error' : ''}`}
              >
                <fieldset className="govuk-fieldset" aria-describedby="failed-areas-hint">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h3 className="govuk-heading-s">
                      Confirm which of the following sensitive areas your route passes through:
                    </h3>
                  </legend>
                  {formErrors.includes(SENSITIVE_AREA_ERRORS.CONFIRM_FAILED_AREAS) && (
                    <span id="failed-areas-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {SENSITIVE_AREA_ERRORS.CONFIRM_FAILED_AREAS}
                    </span>
                  )}
                  <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                    {allFailedAreas.map((area) => (
                      <div className="govuk-checkboxes__item" key={area.layerId}>
                        <input
                          className="govuk-checkboxes__input"
                          id={`failed-area-${area.layerId}`}
                          name={`failed-area-${area.layerId}`}
                          type="checkbox"
                          checked={!!selectedFailedLayers[area.layerId]}
                          onChange={() => handleFailedLayerToggle(area.layerId)}
                          aria-describedby={area.errorMessage ? `failed-area-${area.layerId}-hint` : undefined}
                        />
                        <label 
                          className="govuk-label govuk-checkboxes__label" 
                          htmlFor={`failed-area-${area.layerId}`}
                        >
                          {area.layerName}
                          {area.errorMessage && (
                            <span className="govuk-hint govuk-checkboxes__hint" id={`failed-area-${area.layerId}-hint`}>
                              Error: {area.errorMessage}
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          )}

          {/* No sensitive areas passed */}
          {allPassedAreas.length === 0 && !hasAnyFailedAreas && clearedAreas.length === 0 && (
            <div className="govuk-inset-text">
              The route does not pass through any of the automatically checked sensitive areas
            </div>
          )}

          <div className="govuk-form-group govuk-!-margin-bottom-6">
            <label className="govuk-label govuk-!-font-size-19" htmlFor="otherAreas">
              What other sensitive areas does the route pass through? (optional)
            </label>
            <textarea
              id="otherAreas"
              name="otherAreas"
              className="govuk-textarea"
              rows={4}
              maxLength={4000}
              value={otherAreas}
              onChange={e => setOtherAreas(e.target.value)}
              style={{ width: '100%', maxWidth: 600 }}
              aria-describedby="otherAreas-count"
            />
            <div id="otherAreas-count" className="govuk-hint govuk-character-count__message">You have {4000 - otherAreas.length} characters remaining</div>
          </div>

          <h2 className="govuk-heading-m">Environmental and archaeological documents</h2>
          <div id="document-upload" className={`govuk-form-group govuk-!-margin-bottom-6${formErrors.includes(SENSITIVE_AREA_ERRORS.UPLOAD_AT_LEAST_ONE_DOCUMENT) ? ' govuk-form-group--error' : ''}`}> 
            {formErrors.includes(SENSITIVE_AREA_ERRORS.UPLOAD_AT_LEAST_ONE_DOCUMENT) && (
              <span className="govuk-error-message">
                {SENSITIVE_AREA_ERRORS.UPLOAD_AT_LEAST_ONE_DOCUMENT}
              </span>
            )}
            <FileUpload
              ref={fileUploadRef}
              title="Environmental and archaeological documents"
              prefix={`${effectiveApplicationId}/${FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}`}
              applicationId={effectiveApplicationId}
              category={FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}
              addedBy={review?.reviewed_by || 'current-user'}
              uploadedFiles={uploadedFiles}
              onPendingFilesChange={(files) => setPendingFiles(files)}
            />
          </div>

          <details className="govuk-details govuk-!-margin-bottom-6" data-module="govuk-details">
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">What information should be included in the environmental and archaeological documents</span>
            </summary>
            <div className="govuk-details__text">
              Upload all the supporting documentation and environmental reports relating to your application. This should include Natural England / Natural Resources Wales as well as ecological reports, heritage reports and evidence of other consultations you have had with statutory bodies
            </div>
          </details>

          <div id="pole-radio-group" className={`govuk-form-group govuk-!-margin-bottom-6${formErrors.includes(SENSITIVE_AREA_ERRORS.SELECT_POLE_OPTION) ? ' govuk-form-group--error' : ''}`}> 
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                Are any poles within the identified sensitive areas or are the lines just overhead?
              </legend>
              {formErrors.includes(SENSITIVE_AREA_ERRORS.SELECT_POLE_OPTION) && (
                <span className="govuk-error-message">
                  {SENSITIVE_AREA_ERRORS.SELECT_POLE_OPTION}
                </span>
              )}
              <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="polesWithinSensitiveAreas"
                    name="polesWithinSensitiveAreas"
                    type="radio"
                    value={SensitiveAreaPoleOption.POLES_WITHIN}
                    checked={poleOption === SensitiveAreaPoleOption.POLES_WITHIN}
                    onChange={() => setPoleOption(SensitiveAreaPoleOption.POLES_WITHIN)}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="polesWithinSensitiveAreas">There are poles within the sensitive areas</label>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="polesOutsideWithLines"
                    name="polesWithinSensitiveAreas"
                    type="radio"
                    value={SensitiveAreaPoleOption.ONLY_OVERHEAD}
                    checked={poleOption === SensitiveAreaPoleOption.ONLY_OVERHEAD}
                    onChange={() => setPoleOption(SensitiveAreaPoleOption.ONLY_OVERHEAD)}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="polesOutsideWithLines">All poles are outside of the sensitive areas with only the overhead lines passing above them</label>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="noPolesWithinSensitiveAreas"
                    name="polesWithinSensitiveAreas"
                    type="radio"
                    value={SensitiveAreaPoleOption.NO_POLES_WITHIN}
                    checked={poleOption === SensitiveAreaPoleOption.NO_POLES_WITHIN}
                    onChange={() => setPoleOption(SensitiveAreaPoleOption.NO_POLES_WITHIN)}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="noPolesWithinSensitiveAreas">No poles are within a sensitive area and no overhead lines pass above them</label>
                </div>
              </div>
            </fieldset>
          </div>

          <button
            type="button"
            className="govuk-button"
            data-module="govuk-button"
            onClick={() => handleSaveReview('continue')}
          >
            Save and continue
          </button>
          <button
            type="button"
            className="govuk-button govuk-button--secondary govuk-!-margin-left-3"
            data-module="govuk-button"
            onClick={() => handleSaveReview('later')}
          >
            Save for later
          </button>
        </>
      )}
      </div>
      </div>
    </div>
  );
};

export default SensitiveAreaReviewPage;
