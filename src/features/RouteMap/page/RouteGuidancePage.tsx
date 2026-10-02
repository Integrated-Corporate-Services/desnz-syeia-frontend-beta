
import React from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { Link, useNavigate } from 'react-router-dom';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import RouteGuidanceExampleMap from '../component/RouteGuidanceExampleMap';
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

const ExamplePointCards: React.FC<{ routeName: string; points: ExamplePoint[] }> = ({ routeName, points }) => (
  <div className="app-route-example__point-list">
    <h4 className="govuk-heading-s">{routeName}</h4>
    <p className="govuk-visually-hidden">The action labels shown on these example points are illustrative and are not interactive on this page.</p>
    {points.map((point, index) => (
      <section className="govuk-summary-card app-route-example__point-card" key={`${point.easting}-${point.northing}`}>
        <div className="govuk-summary-card__title-wrapper">
          <div className="app-route-example__point-heading">
            <h5 className="govuk-summary-card__title">Point {index + 1}</h5>
            <span className="app-route-example__point-actions" aria-hidden="true">
              <span>Add before</span>
              <span>Add after</span>
              <span>Remove</span>
            </span>
          </div>
        </div>
        <div className="govuk-summary-card__content">
          <dl className="app-route-example__coordinates">
            <div>
              <dt className="govuk-body">Easting</dt>
              <dd>{point.easting}</dd>
            </div>
            <div>
              <dt className="govuk-body">Northing</dt>
              <dd>{point.northing}</dd>
            </div>
          </dl>
        </div>
      </section>
    ))}
  </div>
);

const ExampleRouteSummary: React.FC<{ routeName: string; points: ExamplePoint[] }> = ({ routeName, points }) => (
  <section className="govuk-summary-card app-route-example__route-card">
    <div className="govuk-summary-card__title-wrapper">
      <h4 className="govuk-summary-card__title">{routeName}</h4>
    </div>
    <div className="govuk-summary-card__content">
      <table className="govuk-table app-route-example__table">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">Easting</th>
            <th scope="col" className="govuk-table__header">Northing</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {points.map((point) => (
            <tr className="govuk-table__row" key={`${point.easting}-${point.northing}`}>
              <td className="govuk-table__cell">{point.easting}</td>
              <td className="govuk-table__cell">{point.northing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
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
          <div className="app-route-example__content">
            <ExamplePointCards routeName="Route A" points={ROUTE_A} />
            <div className="app-route-example__map">
              <RouteGuidanceExampleMap
                routes={[{ points: ROUTE_A, routeName: 'Route A' }]}
                numberedRouteName="Route A"
              />
            </div>
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
          <div className="app-route-example__content">
            <ExamplePointCards routeName="Route B" points={ROUTE_B} />
            <div className="app-route-example__map">
              <RouteGuidanceExampleMap
                routes={[
                  { points: ROUTE_A, routeName: 'Route A' },
                  { points: ROUTE_B, routeName: 'Route B' },
                ]}
                numberedRouteName="Route B"
                highlightedRouteName="Route B"
              />
            </div>
          </div>
        </div>
        <div className="app-route-example govuk-!-margin-bottom-8">
          <h3 className="govuk-heading-m app-route-example__overview-heading">Route overview</h3>
          <div className="app-route-example__content app-route-example__content--overview">
            <div className="govuk-inset-text app-route-example__overview-notice">
              <p className="govuk-body">Any changes made to the route will require you to:</p>
              <ol className="govuk-list govuk-list--number">
                <li>Run the sensitive area checks again</li>
                <li>Upload new plan information</li>
                <li>Reconsult or provide updated information to consultees if consultations are open</li>
              </ol>
            </div>
            <div className="app-route-example__tables">
              <ExampleRouteSummary routeName="Route A" points={ROUTE_A} />
              <ExampleRouteSummary routeName="Route B" points={ROUTE_B} />
            </div>
            <div className="app-route-example__map">
              <RouteGuidanceExampleMap
                routes={[
                  { points: ROUTE_A, routeName: 'Route A' },
                  { points: ROUTE_B, routeName: 'Route B' },
                ]}
              />
            </div>
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
