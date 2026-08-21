import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SensitiveAreaCheckMap from '../../../components/SensitiveAreaCheckMap';
import { useRoutes } from '../../../hooks/useRoutes';
import PageTitle from '../../../components/PageTitle';

const RouteMapOnlyPage: React.FC = () => {
  const { applicationId } = useParams();
  const { routes, fetchRoutes } = useRoutes();

  // Fetch routes on mount if applicationId is present
  useEffect(() => {
    if (applicationId) {
      fetchRoutes(applicationId);
    }
  }, [applicationId, fetchRoutes]);

  // Transform routes as needed for SensitiveAreaCheckMap
  const transformedRoutes = routes
    .filter(r => Array.isArray(r.gridPoints) && r.gridPoints.length > 0)
    .map(r => ({
      points: (r.gridPoints || []).map(pt => ({
        easting: String(pt.easting || ""),
        northing: String(pt.northing || ""),
      })),
      routeName: r.routeName || "Route",
    }));

  return (
    <div style={{ width: 960, height: 510, background: "#fff" }}>
      <PageTitle title="Route map" />
      <SensitiveAreaCheckMap
        routes={transformedRoutes}
        mode="overview"
      />
    </div>
  );
};

export default RouteMapOnlyPage;