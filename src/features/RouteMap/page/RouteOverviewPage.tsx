import React from 'react';
import SensitiveAreaCheckMap from '../../../components/SensitiveAreaCheckMap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import RouteDeletedBanner from '../component/RouteDeletedBanner';
import { useRouteStore } from '../../../store/useRouteStore';

export const RouteOverviewPage: React.FC = () => {
  const [spurChoice, setSpurChoice] = React.useState<string | null>(null);
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const store = useRouteStore();
  let routes = Array.isArray(store?.routes) ? store.routes : [];
  // Sort routes by routeName (A, B, C, ...)
  routes = [...routes].sort((a, b) => {
    const getLetter = (r: any) => {
      if (!r.routeName) return '';
      const match = r.routeName.match(/Route\s+([A-Z])/i);
      return match ? match[1].toUpperCase() : '';
    };
    const aLetter = getLetter(a);
    const bLetter = getLetter(b);
    if (aLetter && bLetter) return aLetter.localeCompare(bLetter);
    if (aLetter) return -1;
    if (bLetter) return 1;
    return 0;
  });
  const loading = store?.loading;
  const error = store?.error;
  const fetchRoutes = store?.fetchRoutes;
  // Banner state
  const [showBanner, setShowBanner] = React.useState<{ routeName: string } | null>(null);

  React.useEffect(() => {
    if (location.state && location.state.routeDeletedName) {
      setShowBanner({ routeName: location.state.routeDeletedName });
  // Remove state from history so banner doesn't persist on refresh
  navigate(location.pathname, { replace: true, state: undefined });
    }
  }, [location, navigate]);

  React.useEffect(() => {
    if (applicationId && fetchRoutes) fetchRoutes(applicationId);
  }, [applicationId, fetchRoutes]);


  // Helper to get next route name (A, B, C, ...)
  const getNextRouteName = () => {
    if (!routes.length) return 'Route A';
    // Find highest letter used
    const usedLetters = routes
      .map(r => r.routeName)
      .filter((name): name is string => typeof name === 'string')
      .map(name => name.replace('Route ', ''));
    let maxCharCode = 64; // 'A' - 1
    usedLetters.forEach(l => {
      if (l.length === 1) {
        const code = l.charCodeAt(0);
        if (code > maxCharCode) maxCharCode = code;
      }
    });
    return `Route ${String.fromCharCode(maxCharCode + 1)}`;
  };

  const handleEdit = (route_id: string | number) => {
    const route = routes.find(r => r.route_id === route_id);
    if (!route) return;
    navigate('/route-map', { state: { route_id: route.route_id, gridPoints: route.gridPoints, applicationId, routeName: route.routeName } });
  };

  const handleDelete = (route_id: string | number) => {
    const route = routes.find(r => r.route_id === route_id);
    if (!route) return;
    navigate('/route-delete', {
      state: {
        routeName: route.routeName || 'Route',
        gridPoints: route.gridPoints,
        applicationId,
        route_id: route.route_id,
      },
    });
  };

  const hasRoute = routes.length > 0 && routes.some(r => Array.isArray(r.gridPoints) && r.gridPoints.length > 0);

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <a
              className="govuk-breadcrumbs__link"
              href={`/task-list?id=${applicationId || ''}`}
              onClick={e => {
                e.preventDefault();
                navigate(`/task-list?id=${applicationId || ''}`);
              }}
            >
              Task list
            </a>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Route overview</li>
        </ol>
      </nav>
      <main className="govuk-main-wrapper" id="main-content" role="main">
        {showBanner && <RouteDeletedBanner routeName={showBanner.routeName} />}
        <h1 className="govuk-heading-xl">Route overview</h1>
        <div className="govuk-inset-text" style={{ maxWidth: 700 }}>
          <p className="govuk-body">Any changes made to the route will require you to:</p>
          <ol className="govuk-list govuk-list--number">
            <li>Run the sensitive area checks again</li>
            <li>Upload new plan information</li>
            <li>Reconsult or provide updated information to consultees if consultations are open</li>
          </ol>
        </div>
        {loading && <div>Loading routes...</div>}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        {hasRoute && (
          <div className="govuk-grid-row" style={{ marginBottom: '2rem' }}>
            <div className="govuk-grid-column-one-half">
              {routes.map((route, idx) => (
                Array.isArray(route.gridPoints) && route.gridPoints.length > 0 && (
                  <div className="govuk-summary-card" id={`route-summary-${idx}`} key={route.route_id || idx} style={{ marginBottom: '2rem' }}>
                    <div className="govuk-summary-card__title-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 className="govuk-summary-card__title">{route.routeName || `Route ${String.fromCharCode(65 + idx)}`}</h2>
                      <ul className="govuk-summary-card__actions" style={{ display: 'flex', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                        <li className="govuk-summary-card__action">
                          <a className="govuk-link" href="#" onClick={e => { e.preventDefault(); handleEdit(route.route_id || idx); }}>Edit<span className="govuk-visually-hidden"> {route.routeName}</span></a>
                        </li>
                        <li className="govuk-summary-card__action">
                          <a className="govuk-link" href="#" onClick={e => { e.preventDefault(); handleDelete(route.route_id || idx); }}>Delete<span className="govuk-visually-hidden"> {route.routeName}</span></a>
                        </li>
                      </ul>
                    </div>
                    <div className="govuk-summary-card__content">
                      <table className="govuk-table">
                        <thead className="govuk-table__head">
                          <tr className="govuk-table__row">
                            <th className="govuk-table__header">Easting</th>
                            <th className="govuk-table__header">Northing</th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {route.gridPoints.map((pt: any, i: number) => (
                            <tr className="govuk-table__row" key={i}>
                              <td className="govuk-table__cell">{pt.easting}</td>
                              <td className="govuk-table__cell">{pt.northing}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ))}
            </div>
            <div className="govuk-grid-column-one-half">
              {/* Show map for the first route with gridPoints */}
              <div style={{ width: 466, height: 500, border: '1px solid #b1b4b6', borderRadius: 4, overflow: 'hidden', background: '#fff', margin: '0 auto' }}>
                <SensitiveAreaCheckMap
                  routes={routes.filter(r => Array.isArray(r.gridPoints) && r.gridPoints.length > 0).map(r => ({
                    points: r.gridPoints.map((pt: any) => ({ easting: String(pt.easting), northing: String(pt.northing) })),
                    routeName: r.routeName
                  }))}
                  mode="overview"
                />
              </div>
            </div>
          </div>
        )}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <form onSubmit={e => {
              e.preventDefault();
              if (spurChoice === 'now') {
                // Start a fresh route map for the next route (do not pass gridPoints)
                navigate('/route-map', { state: { applicationId, routeName: getNextRouteName(), isNewRoute: true } });
              } else if (spurChoice === 'later') {
                navigate('/route-map', { state: { applicationId } });
              } else {
                navigate('/task-list');
              }
            }}>
              <div className="govuk-form-group">
                <fieldset className="govuk-fieldset" aria-describedby="fieldset-1-hint">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading">
                      Do you want to add another route spur?
                    </h2>
                  </legend>
                  <div className="govuk-hint" id="fieldset-1-hint">
                    If your route has a spur off the main route, you will need to add another route spur
                  </div>
                  <div className="govuk-radios">
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="addRouteRadioOption" name="addRouteRadioOption" type="radio" value="now" checked={spurChoice === 'now'} onChange={() => setSpurChoice('now')} />
                      <label className="govuk-label govuk-radios__label" htmlFor="addRouteRadioOption">
                        Yes, I want to add one now
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="addRouteRadioOption-2" name="addRouteRadioOption" type="radio" value="later" checked={spurChoice === 'later'} onChange={() => setSpurChoice('later')} />
                      <label className="govuk-label govuk-radios__label" htmlFor="addRouteRadioOption-2">
                        Yes, I want to add one later
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="addRouteRadioOption-3" name="addRouteRadioOption" type="radio" value="no" checked={spurChoice === 'no'} onChange={() => setSpurChoice('no')} />
                      <label className="govuk-label govuk-radios__label" htmlFor="addRouteRadioOption-3">
                        No, I have added all the routes
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
              <button type="submit" className="govuk-button" data-module="govuk-button" style={{ marginTop: 8 }}>Submit</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RouteOverviewPage;
