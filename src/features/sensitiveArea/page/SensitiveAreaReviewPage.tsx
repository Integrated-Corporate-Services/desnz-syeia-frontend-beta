import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getSensitiveAreas } from '../../../services/sensitiveAreaService';

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
  }, [effectiveApplicationId]);

  return (
    <div className="govuk-width-container">
      <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Sensitive area review</h1>
      {loading ? (
        <div>Loading sensitive areas...</div>
      ) : error ? (
        <div className="govuk-error-message">{error}</div>
      ) : (
        <>
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
          <div className="govuk-!-margin-bottom-6">
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
          <div className="govuk-form-group govuk-!-margin-bottom-6">
            <div style={{ border: '2px dashed #b1b4b6', padding: '2rem', textAlign: 'center', background: '#f8f8f8', maxWidth: 600 }}>
              Drag and drop your documents here, or <a href="#" className="govuk-link">choose a file</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SensitiveAreaReviewPage;
