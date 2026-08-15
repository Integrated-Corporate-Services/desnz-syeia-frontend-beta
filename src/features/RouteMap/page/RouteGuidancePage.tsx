
import React from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { Link, useNavigate } from 'react-router-dom';
import eipSimpleRoute from '../../../assets/eip_simple_route-1.png';
import eipMultipleRoutes from '../../../assets/eip_multiple_routes-2.png';
import eipRouteOverview from '../../../assets/eip_route_overview-3.png';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

const RouteGuidancePage: React.FC = () => {
  const navigate = useNavigate();
   const applicationId = useGetApplicationId();
  
  return (
    <>
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
          <h1 className="govuk-heading-l">Route guidance</h1>

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
          className="govuk-!-margin-bottom-4"
          role="img"
          aria-label="Example showing a simple route with 5 coordinate points marked on a map. Points are numbered 1 through 5, showing where the overhead line changes direction."
        >
          <div className="govuk-visually-hidden">
            <h3>Route A Example</h3>
            <p>This example shows how to enter coordinates for points where the route changes direction. You only need to enter coordinates at direction changes, not at every pole location.</p>
            <p>The example shows 5 points with their Easting and Northing coordinates displayed in a form on the left, with the corresponding route visualized on a map on the right.</p>
          </div>
          <img
            src={eipSimpleRoute}
            alt=""
            className="eip-guidance-image"
            style={{ maxWidth: '100%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
            aria-hidden="true"
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
          role="img"
          aria-label="Example showing how to create route spurs. Route B connects to Route A at a shared coordinate point. The image demonstrates that you join routes by using the same coordinate in both route lines."
        >
          <div className="govuk-visually-hidden">
            <h3>Route B with Spur Example</h3>
            <p>This example shows Route B (the spur) highlighted on the map, indicating it is currently being edited. Route B starts at a coordinate that already exists in Route A, creating a connection point.</p>
            <p>The form shows 3 points for Route B with their Easting and Northing coordinates. On the map, you can see how Route B branches off from Route A at a shared coordinate point.</p>
          </div>
          <img
            src={eipMultipleRoutes}
            alt=""
            className="eip-guidance-image"
            style={{ maxWidth: '100%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
            aria-hidden="true"
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
          role="img"
          aria-label="Route overview page showing both Route A and Route B with all coordinate points listed in tables. The map displays how both routes connect at a shared coordinate."
        >
          <div className="govuk-visually-hidden">
            <h3>Route Overview Example</h3>
            <p>Important: Any changes made to the route will require you to:</p>
            <ol>
              <li>Run the sensitive area checks again</li>
              <li>Upload new plan information</li>
              <li>Reconsult or provide updated information to consultees if consultations are open</li>
            </ol>
            <p>The overview shows two sections:</p>
            <ul>
              <li>Route A: Lists all coordinate points with Easting and Northing values, with Edit and Delete options</li>
              <li>Route B: Lists all coordinate points with Easting and Northing values, with Edit and Delete options</li>
            </ul>
            <p>The map on the right visualizes both routes and their connection point.</p>
          </div>
          <img
            src={eipRouteOverview}
            alt=""
            className="eip-guidance-image"
            style={{ maxWidth: '100%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
            aria-hidden="true"
          />
        </div>
        <button
          type="button"
          className="govuk-button govuk-button--primary"
          onClick={() => navigate(`${S37_BASE_URL}/${applicationId}/route-map`, { state: { isNewRoute: true } })}
        >
          Add a route
        </button>
        </div>
      </div>
            </div>
    </>
  );
};

export default RouteGuidancePage;
