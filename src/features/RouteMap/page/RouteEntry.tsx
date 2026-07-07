import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';

interface RouteEntryProps {
  applicationId: string;
  children: React.ReactNode;
}

import { getRoutesWithPoints } from '../../../services/routeMapService';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

const RouteEntry: React.FC<RouteEntryProps> = ({  children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const applicationId = useGetApplicationId();

  const handleRouteClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!applicationId || loading) return;
    setLoading(true);
    try {
      const data = await getRoutesWithPoints(applicationId);
      if (data && data.routes && data.routes.length > 0) {
        navigate(`${S37_BASE_URL}/${applicationId}/route-overview`);
      } else {
        navigate(`${S37_BASE_URL}/${applicationId}/route-guidance`);
      }
    } catch (err) {
  navigate(`${S37_BASE_URL}/${applicationId}/route-guidance`);
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
