import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRouteStore } from '../../../store/useRouteStore';

interface RouteEntryProps {
  applicationId: string;
  children: React.ReactNode;
}

import { getRoutesWithPoints } from '../../../services/routeMapService';

const RouteEntry: React.FC<RouteEntryProps> = ({ applicationId, children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleRouteClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!applicationId || loading) return;
    setLoading(true);
    try {
      const data = await getRoutesWithPoints(applicationId);
      if (data && data.routes && data.routes.length > 0) {
        navigate(`/route-overview/${applicationId}`);
      } else {
        navigate(`/route-guidance?id=${applicationId}`);
      }
    } catch (err) {
      navigate(`/route-guidance?id=${applicationId}`);
    } finally {
      setLoading(false);
    }
  }, [applicationId, navigate, loading]);

  return (
    <span
      onClick={handleRouteClick}
      style={{ cursor: loading ? 'wait' : 'pointer', pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.6 : 1 }}
      aria-disabled={loading}
    >
      {loading ? <span className="govuk-visually-hidden">Loading...</span> : children}
    </span>
  );
};

export default RouteEntry;
