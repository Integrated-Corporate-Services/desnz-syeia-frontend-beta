import React from 'react';
import SensitiveAreaCheckMap from '../../../components/SensitiveAreaCheckMap';
import { useParams, useNavigate } from 'react-router-dom';
import { useRouteStore } from '../../../store/useRouteStore';

export const RouteOverviewPage: React.FC = () => {
  const [spurChoice, setSpurChoice] = React.useState<string | null>(null);
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const store = useRouteStore();
  const routes = Array.isArray(store?.routes) ? store.routes : [];
  const loading = store?.loading;
  const error = store?.error;
  const fetchRoutes = store?.fetchRoutes;

  React.useEffect(() => {
    if (applicationId && fetchRoutes) fetchRoutes(applicationId);
  }, [applicationId, fetchRoutes]);

  const handleEdit = (gridPoints: any[]) => {
    navigate('/route-map', { state: { gridPoints, applicationId } });
  };

  const handleDelete = (routeIdx: number) => {
    // TODO: Implement delete logic
    alert('Delete route not implemented');
  };

  const hasRoute = routes.length > 0 && routes[0] && Array.isArray(routes[0].gridPoints);
  const gridPoints = hasRoute ? routes[0].gridPoints : [];

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
              <div className="govuk-summary-card" id="route-1-summary">
                <div className="govuk-summary-card__title-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="govuk-summary-card__title">Route A</h2>
                  <ul className="govuk-summary-card__actions" style={{ display: 'flex', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                    <li className="govuk-summary-card__action">
                      <a className="govuk-link" href="#" onClick={e => { e.preventDefault(); handleEdit(gridPoints); }}>Edit<span className="govuk-visually-hidden"> route a</span></a>
                    </li>
                    <li className="govuk-summary-card__action">
                      <a className="govuk-link" href="#" onClick={e => { e.preventDefault(); handleDelete(0); }}>Delete<span className="govuk-visually-hidden"> route a</span></a>
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
                      {gridPoints.map((pt: any, i: number) => (
                        <tr className="govuk-table__row" key={i}>
                          <td className="govuk-table__cell">{pt.easting}</td>
                          <td className="govuk-table__cell">{pt.northing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div style={{ width: 466, height: 500, border: '1px solid #b1b4b6', borderRadius: 4, overflow: 'hidden', background: '#fff', margin: '0 auto' }}>
                <SensitiveAreaCheckMap
                  points={gridPoints.map((pt: any) => ({ easting: String(pt.easting), northing: String(pt.northing) }))}
                  selectedIdx={null}
                  setPoints={() => { }}
                  setSelectedIdx={() => { }}
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
                navigate('/route-map', { state: { gridPoints, applicationId } });
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
