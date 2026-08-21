import React from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRoutes } from '../../../hooks/useRoutes';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import PageTitle from '../../../components/PageTitle';

const RouteDeletePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Route details passed via state
  const { routeName, gridPoints, route_id } = location.state || {};

  const applicationId = useGetApplicationId();
  const { routes, deleteRoute, fetchRoutes } = useRoutes();

  // If no route details, redirect back
  React.useEffect(() => {
    if (!routeName || !Array.isArray(gridPoints)) {
      navigate(`${S37_BASE_URL}/${applicationId || ''}/route-overview`);
    }
  }, [routeName, gridPoints, applicationId, navigate]);

  const handleCancel = (e: React.MouseEvent) => {
  e.preventDefault();
  navigate(`${S37_BASE_URL}/${applicationId || ''}/route-overview`);
  };


  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (route_id && applicationId) {
      await deleteRoute(applicationId, route_id);
      if (fetchRoutes) await fetchRoutes(applicationId);
    }
    // Check if there are any routes left after deletion
    const hasRoutes = Array.isArray(routes) && routes.length > 1; // More than 1 because current one will be deleted
    const bannerState = { state: { routeDeletedName: routeName } };
    if (!hasRoutes) {
      navigate(`${S37_BASE_URL}/${applicationId || ''}/task-list`, bannerState);
    } else {
      navigate(`${S37_BASE_URL}/${applicationId || ''}/route-overview`, bannerState);
    }
  };

  return (
    <div className="govuk-grid-row">
      <PageTitle title="Delete route" />
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