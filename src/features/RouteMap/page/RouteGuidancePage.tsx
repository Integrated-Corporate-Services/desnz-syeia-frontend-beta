
import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import eipSimpleRoute from '../../../assets/eip_simple_route-1.png';
import eipMultipleRoutes from '../../../assets/eip_multiple_routes-2.png';
import eipRouteOverview from '../../../assets/eip_route_overview-3.png';

const RouteGuidancePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const applicationId = params.get('id') || '';
  return (
    <div className="govuk-width-container">
      <nav
        className="govuk-breadcrumbs"
        aria-label="Breadcrumb"
        style={{ marginBottom: '2rem' }}
      >
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to={`/task-list?id=${applicationId}`}>
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Route guidance</li>
        </ol>
      </nav>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Route guidance</h1>

        <h2 className="govuk-heading-l">Creating a route</h2>
        <p className="govuk-body">
          In a moment we're going to ask you to enter the route of the overhead line involved in your application.
          You will need to enter Ordnance Survey National Grid (OSGB) coordinates for each change of direction.
        </p>
        <p className="govuk-body">
          You are not required to enter coordinates for each pole in your route.
          In the example below you can see how there are only coordinates where the route changes direction.
        </p>
        <div
          style={{
            border: '1px solid #bbb',
            borderRadius: '4px',
            background: '#fff',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            textAlign: 'center'
          }}
        >
          <img
            src={eipSimpleRoute}
            alt="A simple route with multiple coordinates"
            className="eip-guidance-image"
            style={{ maxWidth: '100%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
          />
        </div>

        <h2 className="govuk-heading-l">Adding a spur</h2>
        <p className="govuk-body">
          If your route contains multiple endpoints, you will need to add a route spur to your application.
          When editing a route, the route you're working on will be highlighted on the map.
        </p>
        <p className="govuk-body">
          To join your routes together, enter a set of coordinates that is common to both route lines.
          In the example below you can see how the second route, Route B, starts at a coordinate that is already mapped in Route A.
        </p>
        <p className="govuk-body">
          If application contains routes that do not connect, please create a separate application for each separate route unless you have a justification to provide to DESNZ.
        </p>
        <div
          style={{
            border: '1px solid #bbb',
            borderRadius: '4px',
            background: '#fff',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            textAlign: 'center'
          }}
        >
          <img
            src={eipMultipleRoutes}
            alt="A route with two spurs, with one of the route spurs highlighted to show it's being edited"
            className="eip-guidance-image"
            style={{ maxWidth: '100%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
          />
        </div>
        <div
          style={{
            border: '1px solid #bbb',
            borderRadius: '4px',
            background: '#fff',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            textAlign: 'center'
          }}
        >
          <img
            src={eipRouteOverview}
            alt="Overview of routes, showing a route with two spurs and the coordinates of both routes"
            className="eip-guidance-image"
            style={{ maxWidth: '100%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
          />
        </div>
        <button
          type="button"
          className="govuk-button govuk-button--primary"
          style={{ marginTop: '2rem' }}
          onClick={() => navigate(`/route-map?id=${applicationId}`)}
        >
          Add a route
        </button>
        </div>
      </div>
    </div>
  );
};

export default RouteGuidancePage;
