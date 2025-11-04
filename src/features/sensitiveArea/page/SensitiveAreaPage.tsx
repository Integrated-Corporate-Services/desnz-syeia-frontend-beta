import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSensitiveAreaSettings } from '../../../services/sensitiveAreaSettingsService';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { startSensitiveAreaCheck } from '../../../services/sensitiveAreaService';
import { getRoutesWithPoints } from '../../../services/routeMapService';
import SensitiveAreaCheckMap, { RoutePoint } from '../../../components/SensitiveAreaCheckMap';
import { S37_BASE_URL } from '../../../constants/s37';

const SensitiveAreaPage: React.FC = () => {
  // Get applicationId from URL params or query string
  const { applicationId } = useParams<{ applicationId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');
  const effectiveApplicationId = applicationId || queryId || '';
  const [toleranceRequired, setToleranceRequired] = useState<string | null>(null);
  const [toleranceValue, setToleranceValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const errorMessage = 'Select yes if the route requires tolerance';
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();
  // Support multiple routes, initially empty
  const [routes, setRoutes] = useState<any[]>([]);

  // Fetch routes for the application when available
  useEffect(() => {
    async function fetchRoutesAndSettings() {
      try {
        const data = await getRoutesWithPoints(effectiveApplicationId);
        setRoutes(data.routes || []);
        // Fetch sensitive area settings
        const settings = await getSensitiveAreaSettings(effectiveApplicationId);
        console.log('Fetched sensitive area settings:', settings);
        if (Array.isArray(settings) && settings.length > 0) {
          const first = settings[0];
          if (typeof first.tolerance_required === 'boolean') {
            setToleranceRequired(first.tolerance_required ? 'yes' : 'no');
          }
          if (typeof first.tolerance_meters === 'number' || typeof first.tolerance_meters === 'string') {
            setToleranceValue(String(first.tolerance_meters ?? ''));
          }
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    if (effectiveApplicationId) fetchRoutesAndSettings();
  }, [effectiveApplicationId]);

  const handleStartCheck = async () => {
    setFormError(null);
    setError(null);
    if (!toleranceRequired) {
      setError(errorMessage);
      return;
    }
    if (toleranceRequired === 'yes') {
      if (!toleranceValue.trim()) {
        setFormError('Enter the route tolerance');
        return;
      }
      // Check for integer (0 decimal places)
      if (!/^\d+$/.test(toleranceValue.trim())) {
        setFormError('The route tolerance must have 0 decimal places');
        return;
      }
    }
    setLoading(true);
    try {
      // Pass the radio button value and tolerance value to backend
      startSensitiveAreaCheck(
        effectiveApplicationId,
        toleranceRequired || 'no', // always pass a string
        (toleranceRequired === 'yes' ? Number(toleranceValue) : 0),
        routes
      ); // run in background, don't await
      // Redirect to task list page after starting check, pass state for notification
      navigate(`${S37_BASE_URL}/${effectiveApplicationId}/task-list`, { state: { showSensitiveAreaPopup: true } });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to start sensitive area check');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        {error && (
          <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title" tabIndex={-1} style={{ marginBottom: '2rem', maxWidth: 600 }}>
            <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li><a href="#routeToleranceRequired">{error}</a></li>
              </ul>
            </div>
          </div>
        )}
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${effectiveApplicationId}/task-list`}>
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Sensitive area check</li>
        </ol>
      </nav>
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            {formError && (
              <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" data-module="govuk-error-summary">
                <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li>
                      <a href="#routeTolerance-inputValue">{formError}</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            <h1 className="govuk-heading-xl">Sensitive area check</h1>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <form method="post" data-module="fds-html-form" onSubmit={e => { e.preventDefault(); handleStartCheck(); }}>
                  {/* <input type="hidden" name="_csrf" value="..." /> */}
                  <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}> 
                    <fieldset className="govuk-fieldset" aria-describedby="fieldset-1-hint">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                        <h2 className="govuk-fieldset__heading">
                          Is any tolerance required either side of the route marked on the plan?
                        </h2>
                      </legend>
                      <div className="govuk-hint" id="fieldset-1-hint">
                        Your route will be buffered by the tolerance provided when checking if it passes through any sensitive areas
                      </div>
                      {/* Inline error message for radio group */}
                      {error && (
                        <span className="govuk-error-message" id="tolerance-error">{error}</span>
                      )}
                        <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                          <div className="govuk-radios__item">
                            <input
                              className="govuk-radios__input"
                              id="routeToleranceRequired"
                              name="routeToleranceRequired"
                              type="radio"
                              value="yes"
                              checked={toleranceRequired === 'yes'}
                              aria-controls="routeToleranceRequired-hidden"
                              aria-expanded={toleranceRequired === 'yes'}
                              onChange={() => setToleranceRequired('yes')}
                              aria-describedby={error ? 'tolerance-error' : undefined}
                            />
                            <label className="govuk-label govuk-radios__label" htmlFor="routeToleranceRequired">Yes</label>
                          </div>
                          {toleranceRequired === 'yes' && (
                            <div className="govuk-radios__conditional" id="routeToleranceRequired-hidden">
                              <div className={`govuk-form-group${formError ? ' govuk-form-group--error' : ''}`}> 
                                <label className="govuk-label" htmlFor="routeTolerance-inputValue">
                                  Tolerance required
                                  <span className="govuk-visually-hidden">in metres</span>
                                </label>
                                {formError && (
                                  <p id="routeTolerance-inputValue-error" className="govuk-error-message">
                                    <span className="govuk-visually-hidden">Error:</span> {formError}
                                  </p>
                                )}
                                <div className="govuk-input__wrapper">
                                  <input
                                    className={`govuk-input govuk-input--width-4${formError ? ' govuk-input--error' : ''}`}
                                    id="routeTolerance-inputValue"
                                    name="routeTolerance.inputValue"
                                    type="text"
                                    value={toleranceValue}
                                    maxLength={4000}
                                    aria-describedby={formError ? 'routeTolerance-inputValue-error' : undefined}
                                    onChange={e => setToleranceValue(e.target.value)}
                                  />
                                  <div className="govuk-input__suffix" aria-hidden="true">metres</div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="govuk-radios__item">
                            <input
                              className="govuk-radios__input"
                              id="routeToleranceRequired-no"
                              name="routeToleranceRequired"
                              type="radio"
                              value="no"
                              checked={toleranceRequired === 'no'}
                              onChange={() => setToleranceRequired('no')}
                              aria-describedby={error ? 'tolerance-error' : undefined}
                            />
                            <label className="govuk-label govuk-radios__label" htmlFor="routeToleranceRequired-no">No</label>
                          </div>
                        </div>
                    </fieldset>
                  </div>
                  <button type="submit" data-module="govuk-button" className="govuk-button" value="Start sensitive area checks" name="Start sensitive area checks" data-prevent-double-click="true">
                    {loading ? 'Checking...' : 'Start sensitive area checks'}
                  </button>
                  {/* Remove duplicate error summary below the button */}
                </form>
              </div>
              <div className="govuk-grid-column-one-half">
                <div data-module="eip-hide-if-ie">
                  <div className="eip-map__container">
                    <SensitiveAreaCheckMap
                      routes={routes.length > 0 ? routes.map(route => ({
                        points: route.gridPoints,
                        routeName: route.routeName
                      })) : []}
                      mode="overview"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SensitiveAreaPage;
