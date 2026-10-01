
import React from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { Link, useNavigate } from 'react-router-dom';
import eipSimpleRouteMap from '../../../assets/eip_simple_route-map.png';
import eipMultipleRoutesMap from '../../../assets/eip_multiple_routes-map.png';
import eipRouteOverviewMap from '../../../assets/eip_route_overview-map.png';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import PageTitle from '../../../components/PageTitle';
import '../../../styles/RouteGuidance.css';

interface ExamplePoint {
  easting: string;
  northing: string;
}

// The example routes, as real text (WCAG 1.4.5). They match the coordinates drawn on the example maps.
const ROUTE_A: ExamplePoint[] = [
  { easting: '420972', northing: '103289' },
  { easting: '420934', northing: '103424' },
  { easting: '420971', northing: '103608' },
  { easting: '420879', northing: '103736' },
  { easting: '420879', northing: '103870' },
];
const ROUTE_B: ExamplePoint[] = [
  { easting: '420879', northing: '103736' },
  { easting: '420813', northing: '103718' },
  { easting: '420748', northing: '103750' },
];

const ExamplePointsTable: React.FC<{ caption: string; points: ExamplePoint[]; showPointNumbers?: boolean }> = ({ caption, points, showPointNumbers = false }) => (
  <table className="govuk-table app-route-example__table">
    <caption className="govuk-table__caption govuk-table__caption--s">{caption}</caption>
    <thead className="govuk-table__head">
      <tr className="govuk-table__row">
        {showPointNumbers && <th scope="col" className="govuk-table__header">Point</th>}
        <th scope="col" className="govuk-table__header">Easting</th>
        <th scope="col" className="govuk-table__header">Northing</th>
      </tr>
    </thead>
    <tbody className="govuk-table__body">
      {points.map((point, index) => (
        <tr className="govuk-table__row" key={`${point.easting}-${point.northing}`}>
          {showPointNumbers && <th scope="row" className="govuk-table__header">Point {index + 1}</th>}
          <td className="govuk-table__cell">{point.easting}</td>
          <td className="govuk-table__cell">{point.northing}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const RouteGuidancePage: React.FC = () => {
  const navigate = useNavigate();
   const applicationId = useGetApplicationId();
  
  return (
    <>
            <PageTitle title="Route guidance" />
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
        <div className="app-route-example govuk-!-margin-bottom-4">
          <h3 className="govuk-heading-m">Example: Route A</h3>
          <div className="app-route-example__content">
            <ExamplePointsTable caption="Coordinates entered for Route A" points={ROUTE_A} showPointNumbers />
            <img
              src={eipSimpleRouteMap}
              alt="Map of Route A: a line through points 1 to 5, running from the south to the north and changing direction at points 2, 3 and 4."
              className="app-route-example__map"
            />
          </div>
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
        <div className="app-route-example govuk-!-margin-bottom-8">
          <h3 className="govuk-heading-m">Example: Route B, a spur joined to Route A</h3>
          <div className="app-route-example__content">
            <ExamplePointsTable caption="Coordinates entered for Route B" points={ROUTE_B} showPointNumbers />
            <img
              src={eipMultipleRoutesMap}
              alt="Map of Route B, highlighted, joined to Route A. Point 1 of Route B is the same coordinate as point 4 of Route A, and Route B runs west from there to point 3."
              className="app-route-example__map"
            />
          </div>
        </div>
        <div className="app-route-example govuk-!-margin-bottom-8">
          <h3 className="govuk-heading-m">Example: route overview</h3>
          <div className="govuk-inset-text">
            <p className="govuk-body">Any changes made to the route will require you to:</p>
            <ol className="govuk-list govuk-list--number">
              <li>Run the sensitive area checks again</li>
              <li>Upload new plan information</li>
              <li>Reconsult or provide updated information to consultees if consultations are open</li>
            </ol>
          </div>
          <div className="app-route-example__content">
            <div className="app-route-example__tables">
              <ExamplePointsTable caption="Route A" points={ROUTE_A} />
              <ExamplePointsTable caption="Route B" points={ROUTE_B} />
            </div>
            <img
              src={eipRouteOverviewMap}
              alt="Map of Route A and Route B together. Route B joins Route A at the coordinate 420879, 103736."
              className="app-route-example__map"
            />
          </div>
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
