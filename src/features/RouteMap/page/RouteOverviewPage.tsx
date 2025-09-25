import React from 'react';
import SensitiveAreaCheckMap from '../../../components/SensitiveAreaCheckMap';
import { useParams, useNavigate } from 'react-router-dom';
import { useRouteStore } from '../../../store/useRouteStore';

export const RouteOverviewPage: React.FC = () => {
  const [spurChoice, setSpurChoice] = React.useState('now');
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { routes, loading, error, fetchRoutes } = useRouteStore();

  React.useEffect(() => {
    if (applicationId) fetchRoutes(applicationId);
  }, [applicationId, fetchRoutes]);

  const handleEdit = (gridPoints: any[]) => {
    navigate('/route-map', { state: { gridPoints, applicationId } });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.05, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
        Route overview
      </h1>
      <div style={{ marginBottom: '2rem', background: '#f8f8f8', padding: '1.5rem 2rem', borderLeft: '8px solid #b1b4b6', fontSize: '1.25rem', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <p style={{ margin: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
          Any changes made to the route will require you to:
        </p>
        <ol style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '1.25rem' }}>
          <li>Run the sensitive area checks again</li>
          <li>Upload new plan information</li>
          <li>Reconsult or provide updated information to consultees if consultations are open</li>
        </ol>
      </div>
      {loading && <div>Loading routes...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {!loading && !error && routes.length > 0 && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            {routes.map((route: any, idx: number) => (
              <div key={idx} style={{ marginBottom: '2rem', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#f3f3f3', padding: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {route.routeName}
                  <span style={{ float: 'right', fontWeight: 'normal', fontSize: '1rem' }}>
                    <button
                      type="button"
                      style={{
                        marginRight: '1rem',
                        background: 'none',
                        border: 'none',
                        color: '#4c2c92', // GOV.UK purple
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      onMouseOver={e => (e.currentTarget.style.color = '#3e2172')}
                      onMouseOut={e => (e.currentTarget.style.color = '#4c2c92')}
                      onFocus={e => (e.currentTarget.style.textDecoration = 'none')}
                      onBlur={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onClick={() => handleEdit(route.gridPoints)}
                    >
                      Edit
                    </button>
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.15rem', background: '#fff' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #bbb' }}>
                      <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontWeight: 700, fontSize: '1.15rem', borderRight: '1px solid #eee' }}>Easting</th>
                      <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontWeight: 700, fontSize: '1.15rem' }}>Northing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {route.gridPoints.map((pt: any, i: number) => (
                      <tr key={i} style={{ background: '#fff' }}>
                        <td
                          style={{
                            padding: '1rem 1.5rem',
                            borderRight: '1px solid #eee',
                            background: '#fff',
                            borderBottom: i === route.gridPoints.length - 1 ? 'none' : '1px solid #eee',
                            borderLeft: '1px solid transparent'
                          }}
                        >
                          {pt.easting}
                        </td>
                        <td
                          style={{
                            padding: '1rem 1.5rem',
                            background: '#fff',
                            borderBottom: i === route.gridPoints.length - 1 ? 'none' : '1px solid #eee',
                            borderRight: '1px solid transparent',
                            borderLeft: '1px solid #eee'
                          }}
                        >
                          {pt.northing}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          <div className="govuk-grid-column-one-half">
            <SensitiveAreaCheckMap
              points={routes.length > 0 ? routes[0].gridPoints.map((pt: any) => ({
                easting: String(pt.easting),
                northing: String(pt.northing)
              })) : []}
              selectedIdx={null}
              setPoints={() => { }}
              setSelectedIdx={() => { }}
            />
          </div>
        </div>
      )}
      {routes.length === 0 ? (
        <button
          style={{ marginBottom: '2rem', background: '#00703c', color: 'white', fontWeight: 600, fontSize: '1.1rem', padding: '0.5rem 2rem', border: 'none', borderRadius: 4 }}
          onClick={() => navigate('/route-map', { state: { applicationId } })}
        >
          Add route
        </button>
      ) : (
        <form
          style={{ marginBottom: '2rem' }}
          onSubmit={e => {
            e.preventDefault();
            if (spurChoice === 'now') {
              navigate('/route-map', { state: { gridPoints: routes[0].gridPoints, applicationId } });
            } else if (spurChoice === 'later') {
              navigate('/route-map', { state: { applicationId } });
            } else {
              navigate('/task-list');
            }
          }}
        >
          <fieldset style={{ border: 'none', padding: 0 }}>
            <legend style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '0.5rem' }}>
              Do you want to add another route spur?
            </legend>
            <div style={{ color: '#5a5a5a', marginBottom: '1.5rem' }}>
              If your route has a spur off the main route, you will need to add another route spur
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem' }}>
                <input
                  type="radio"
                  name="spurChoice"
                  value="now"
                  checked={spurChoice === 'now'}
                  onChange={() => setSpurChoice('now')}
                  style={{ width: 24, height: 24, marginRight: 16 }}
                />
                Yes, I want to add one now
              </label>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem' }}>
                <input
                  type="radio"
                  name="spurChoice"
                  value="no"
                  checked={spurChoice === 'no'}
                  onChange={() => setSpurChoice('no')}
                  style={{ width: 24, height: 24, marginRight: 16 }}
                />
                No, I have added all the routes
              </label>
            </div>
          </fieldset>
          <button type="submit" style={{ marginTop: '1rem', background: '#00703c', color: 'white', fontWeight: 600, fontSize: '1.1rem', padding: '0.5rem 2rem', border: 'none', borderRadius: 4 }}>Submit</button>
        </form>
      )}
    </div>
  );
};

export default RouteOverviewPage;
