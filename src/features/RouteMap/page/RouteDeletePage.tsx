import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRouteStore } from '../../../store/useRouteStore';

const RouteDeletePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Route details passed via state
  const { routeName, gridPoints, applicationId, route_id } = location.state || {};
  const { deleteRoute, fetchRoutes } = useRouteStore();
  const getRouteStore = useRouteStore.getState;

  // If no route details, redirect back
  React.useEffect(() => {
    if (!routeName || !Array.isArray(gridPoints)) {
      navigate('/route-overview/' + (applicationId || ''));
    }
  }, [routeName, gridPoints, applicationId, navigate]);

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/route-overview/' + (applicationId || ''));
  };


  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (route_id) {
      await deleteRoute(route_id);
      if (applicationId && fetchRoutes) await fetchRoutes(applicationId);
    }
    // Get the latest routes from the store after fetch
    const latestRoutes = getRouteStore().routes;
    const hasRoutes = Array.isArray(latestRoutes) && latestRoutes.length > 0;
    const bannerState = { state: { routeDeletedName: routeName } };
    if (!hasRoutes) {
      navigate(`/task-list?id=${applicationId || ''}`, bannerState);
    } else {
      navigate('/route-overview/' + (applicationId || ''), bannerState);
    }
  };

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <form onSubmit={handleDelete} data-module="fds-html-form">
          <h2 className="govuk-heading-l">Are you sure you want to delete {routeName}?</h2>
          <div className="govuk-summary-card" id="route">
            <div className="govuk-summary-card__title-wrapper">
              <h2 className="govuk-summary-card__title">{routeName}</h2>
            </div>
            <div className="govuk-summary-card__content">
              <dl className="govuk-summary-list">
                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th className="govuk-table__header">Easting</th>
                      <th className="govuk-table__header">Northing</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {Array.isArray(gridPoints) && gridPoints.map((pt: any, i: number) => (
                      <tr className="govuk-table__row" key={i}>
                        <td className="govuk-table__cell">{pt.easting}</td>
                        <td className="govuk-table__cell">{pt.northing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </dl>
            </div>
          </div>
          <div className="govuk-button-group" style={{ marginTop: 24 }}>
            <button type="submit" className="govuk-button govuk-button--warning" data-module="govuk-button">
              Delete
            </button>
            <a href="#" className="govuk-link" onClick={handleCancel}>Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteDeletePage;
