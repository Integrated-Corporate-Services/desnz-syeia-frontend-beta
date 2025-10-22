import React, { useEffect, useState } from 'react';
import FileUpload from '../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSensitiveAreas } from '../../../services/sensitiveAreaService';
import { useSensitiveAreaReview } from '../../../store/sensitiveAreaReviewStore';
import { SensitiveAreaPoleOption } from '../../../types/SensitiveAreaPoleOption';

const SensitiveAreaReviewPage: React.FC = () => {
  // Get applicationId from URL params or query string
  const { applicationId } = useParams<{ applicationId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');
  const effectiveApplicationId = applicationId || queryId || '';

  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherAreas, setOtherAreas] = useState('');
  const [poleOption, setPoleOption] = useState<SensitiveAreaPoleOption | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
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
    getSensitiveAreas(effectiveApplicationId)
      .then(data => {
        // Support both { layers: [...] } and { checks: { layers: [...] } }
        const layers = data?.layers || data?.checks?.layers || [];
        setAreas(layers);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch sensitive areas');
        setLoading(false);
      });
    // Fetch sensitive area review data
    fetchReview();
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
      if (Array.isArray(review.documents)) {
        setApplicationDocuments(review.documents);
      }
    }
  }, [review]);

  // Save handler for review
  const handleSaveReview = async () => {
    setFormErrors([]);
    setApiError(null);
    const errors: string[] = [];
    // Validation: require at least one document
    if (!uploadedFiles || uploadedFiles.length === 0) {
      errors.push('Upload at least one environmental and archaeological document');
    }
    if (poleOption === null) {
      errors.push('Select whether there are poles or overhead lines within the sensitive areas');
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
      uploaded_files: uploadedFiles,
      application_documents: applicationDocuments,
    };
    try {
      await saveReview(payload);
      navigate(`/task-list?id=${effectiveApplicationId}`);
    } catch (err: any) {
      setApiError(err?.message || 'Failed to save sensitive area review');
    }
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href={`/frontend/task-list?id=${effectiveApplicationId}`}>Task list</a>
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
                  if (err === 'Upload at least one environmental and archaeological document') href = '#document-upload';
                  if (err === 'Select whether there are poles or overhead lines within the sensitive areas') href = '#pole-radio-group';
                  return <li key={idx}><a href={href}>{err}</a></li>;
                })}
                {apiError && <li><a href="#">{apiError}</a></li>}
              </ul>
            </div>
          )}
          {areas.length === 0 ? (
            <div className="govuk-inset-text">The route does not pass through any of the automatically checked areas</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2rem', marginTop: '2.5rem' }}>
              <div style={{ borderLeft: '8px solid #b1b4b6', paddingLeft: '1.5rem', background: 'none' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                  The route passes through the following sensitive areas:
                </div>
                <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6" style={{ fontSize: '1.15rem' }}>
                  {areas.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              </div>
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
              value={otherAreas}
              onChange={e => setOtherAreas(e.target.value)}
              style={{ width: '100%', maxWidth: 600 }}
            />
          </div>

          <h2 className="govuk-heading-m">Environmental and archaeological documents</h2>
          <div id="document-upload" className={`govuk-form-group govuk-!-margin-bottom-6${formErrors.includes('Upload at least one environmental and archaeological document') ? ' govuk-form-group--error' : ''}`}> 
            {formErrors.includes('Upload at least one environmental and archaeological document') && (
              <span className="govuk-error-message">
                Upload at least one environmental and archaeological document
              </span>
            )}
            <FileUpload
              title="Environmental and archaeological documents"
              prefix={`${effectiveApplicationId}/${FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}`}
              applicationId={effectiveApplicationId}
              category={FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}
              addedBy={review?.reviewed_by || 'current-user'}
              uploadedFiles={uploadedFiles}
              onUploaded={(newUploadedFiles, newProjectDocuments) => {
                setUploadedFiles(prev => {
                  const updated = [...prev, ...newUploadedFiles];
                  return updated;
                });
                setApplicationDocuments(prev => {
                  const updated = [...prev, ...newProjectDocuments];
                  return updated;
                });
              }}
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

          <div id="pole-radio-group" className={`govuk-form-group govuk-!-margin-bottom-6${formErrors.includes('Select whether there are poles or overhead lines within the sensitive areas') ? ' govuk-form-group--error' : ''}`}> 
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                Are any poles within the identified sensitive areas or are the lines just overhead?
              </legend>
              {formErrors.includes('Select whether there are poles or overhead lines within the sensitive areas') && (
                <span className="govuk-error-message">
                  Select whether there are poles or overhead lines within the sensitive areas
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
            className="govuk-button govuk-!-margin-bottom-6"
            onClick={handleSaveReview}
          >
            Save and continue
          </button>
        </>
      )}
      </div>
      </div>
    </div>
  );
};

export default SensitiveAreaReviewPage;
