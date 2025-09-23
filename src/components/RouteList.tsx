import React, { useEffect } from 'react';
import { useRouteStore } from '../store/useRouteStore';

interface RouteListProps {
  applicationId: string;
}

export const RouteList: React.FC<RouteListProps> = ({ applicationId }) => {
  const { routes, loading, error, fetchRoutes } = useRouteStore();

  useEffect(() => {
    if (applicationId) fetchRoutes(applicationId);
  }, [applicationId, fetchRoutes]);

  if (loading) return <div>Loading routes...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!routes.length) return <div>No routes found.</div>;

  return (
    <div>
      <h3>Routes & Grid Points</h3>
      <ul>
        {routes.map((route: any, idx: number) => (
          <li key={idx}>
            <strong>{route.routeName}</strong>
            <ul>
              {route.gridPoints.map((pt: any, i: number) => (
                <li key={i}>Easting: {pt.easting}, Northing: {pt.northing}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};
