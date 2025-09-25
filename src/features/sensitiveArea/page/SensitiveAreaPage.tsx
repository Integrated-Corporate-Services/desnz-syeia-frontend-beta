import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { startSensitiveAreaCheck } from '../../../services/sensitiveAreaService';
import { getRoutesWithPoints } from '../../../services/routeMapService';
import SensitiveAreaCheckMap, { RoutePoint } from '../../../components/SensitiveAreaCheckMap';

const SensitiveAreaPage: React.FC = () => {
  // Get applicationId from URL params or query string
  const { applicationId } = useParams<{ applicationId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');
  const effectiveApplicationId = applicationId || queryId || '';
  const [toleranceRequired, setToleranceRequired] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();
  // Support multiple routes, initially empty
  const [routes, setRoutes] = useState<any[]>([]);

  // Fetch routes for the application when available
  useEffect(() => {
    async function fetchRoutes() {
      try {
        const data = await getRoutesWithPoints(effectiveApplicationId);
        setRoutes(data.routes || []);
      } catch (err) {
        // Optionally handle error
      }
    }
    if (effectiveApplicationId) fetchRoutes();
  }, [effectiveApplicationId]);

  const handleStartCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      // Send all routes and toleranceRequired to backend
      await startSensitiveAreaCheck(effectiveApplicationId, toleranceRequired === 'yes', routes);
      // Redirect to task list page after starting check
      navigate(`/task-list?id=${effectiveApplicationId}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to start sensitive area check');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-one-half">
        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Sensitive area check</h1>
        <div className="govuk-!-margin-bottom-4">
          <h2 className="govuk-heading-m">Is any tolerance required either side of the route marked on the plan?</h2>
          <p>Your route will be buffered by the tolerance provided when checking if it passes through any sensitive areas</p>
          <div className="govuk-radios govuk-radios--inline">
            <div className="govuk-radios__item">
              <input className="govuk-radios__input" id="tolerance-yes" name="tolerance" type="radio" value="yes" checked={toleranceRequired === 'yes'} onChange={() => setToleranceRequired('yes')} />
              <label className="govuk-label govuk-radios__label" htmlFor="tolerance-yes">Yes</label>
            </div>
            <div className="govuk-radios__item">
              <input className="govuk-radios__input" id="tolerance-no" name="tolerance" type="radio" value="no" checked={toleranceRequired === 'no'} onChange={() => setToleranceRequired('no')} />
              <label className="govuk-label govuk-radios__label" htmlFor="tolerance-no">No</label>
            </div>
          </div>
        </div>
        <button className="govuk-button" onClick={handleStartCheck} disabled={!toleranceRequired || loading}>
          {loading ? 'Checking...' : 'Start sensitive area checks'}
        </button>
        {error && <div className="govuk-error-summary govuk-!-margin-top-4"><h2>{error}</h2></div>}
        {/* {result && <div className="govuk-!-margin-top-4"><pre>{JSON.stringify(result, null, 2)}</pre></div>} */}
      </div>
      <div className="govuk-grid-column-one-half">
        {/* Always show the map. If routes exist, show points; otherwise, show empty map. */}
        {routes.length > 0 ? (
          routes.map((route, idx) => (
            <div key={idx} style={{ marginBottom: 24 }}>
              <h3>{route.routeName}</h3>
              <SensitiveAreaCheckMap
                points={route.gridPoints}
                selectedIdx={null}
                setPoints={() => {}}
                setSelectedIdx={() => {}}
              />
            </div>
          ))
        ) : (
          <SensitiveAreaCheckMap
            points={[]}
            selectedIdx={null}
            setPoints={() => {}}
            setSelectedIdx={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default SensitiveAreaPage;
