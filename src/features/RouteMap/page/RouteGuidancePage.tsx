
import React from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import eipSimpleRoute from '../../../assets/eip_simple_route-1.png';
import eipMultipleRoutes from '../../../assets/eip_multiple_routes-2.png';
import eipRouteOverview from '../../../assets/eip_route_overview-3.png';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

const RouteGuidancePage: React.FC = () => {
  const navigate = useNavigate();
   const applicationId = useGetApplicationId();
  
  return (
    <div className="govuk-width-container">
      <nav
        className="govuk-breadcrumbs"
        aria-label="Breadcrumb"
      >
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
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
          On the next screen we will ask you to enter the route of the overhead line(s) included in your application. You will need to enter Ordnance Survey National Grid (OSGB) coordinates for each change of direction.
        </p>
        <p className="govuk-body">
          You are not required to enter coordinates for each pole in your route, only the points where the route changes direction, as shown in the example below.
        </p>
        <p className="govuk-body">
         If you are applying for multiple routes that do not connect, please create a separate application for each route unless you can provide justification to DESNZ, for example: they are connected underground. </p>
        <div
          style={{
            border: '1px solid #bbb',
            borderRadius: '4px',
            background: '#fff',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            textAlign: 'center'
          }}
          className="govuk-!-margin-bottom-8"
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
        </p>
        <p className="govuk-body">
          When editing a route, the route you are working on will be highlighted on the map.
        </p>
        <p className="govuk-body">
          To join your routes together, enter a set of coordinates that is common to both route lines. In the example below you can see how the second route, Route B, starts at a coordinate that is already mapped in Route A.
        </p>
        <p className="govuk-body">
          If you are applying for multiple routes that do not connect, please create a separate application for each route unless you can provide justification to DESNZ, for example: they are connected underground.
        </p>
        <div
          style={{
            border: '1px solid #bbb',
            borderRadius: '4px',
            background: '#fff',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            textAlign: 'center'
          }}
          className="govuk-!-margin-bottom-8"
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            textAlign: 'center'
          }}
          className="govuk-!-margin-bottom-8"
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
          className="govuk-button govuk-button--primary govuk-!-margin-top-8"
          onClick={() => navigate(`${S37_BASE_URL}/${applicationId}/route-map`, { state: { isNewRoute: true } })}
        >
          Add a route
        </button>
        </div>
      </div>
    </div>
  );
};

export default RouteGuidancePage;
