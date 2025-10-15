// Validation function for a single point
function getPointError(easting: string, northing: string) {
  if (!easting && !northing) return 'Enter a grid reference';
  if (!easting) return 'Enter easting';
  if (!northing) return 'Enter northing';
  const valid6 = (val: string) => /^\d{6}$/.test(val) && Number(val) >= 1 && Number(val) <= 999999;
  if (!valid6(easting) || !valid6(northing)) {
    return 'Enter the northing and easting for each grid reference. The northing and easting must be between 000001 and 999999 with leading zeros included.';
  }
  return undefined;
}
import React, { useState, useEffect } from 'react';
import SensitiveAreaCheckMap, { RoutePoint as BaseRoutePoint } from '../../../components/SensitiveAreaCheckMap';
import RoutePointCard from '../component/RoutePointCard';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useRouteStore } from '../../../store/useRouteStore';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true };
  }
  componentDidCatch(error: unknown, errorInfo: unknown) {}
  render() {
    if (this.state.hasError) {
      return <div className="govuk-error-summary"><h2>Something went wrong in the map. Please check your points and try again.</h2></div>;
    }
    return this.props.children;
  }
}

// Extend RoutePoint to include point_id and route_id
interface RoutePoint extends BaseRoutePoint {
  point_id?: string;
  route_id?: string;
}

const RouteMapPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicationId: paramId } = useParams<{ applicationId: string }>();
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');
  const stateId = location.state?.applicationId;
  const effectiveApplicationId = paramId || queryId || stateId || '';

  // Store
  const { routes, loading, error, fetchRoutes, createRoute, saveRoutes, deleteRoutePoints } = useRouteStore();
  // If coming from add new route, use blank state and provided routeName
  const isNewRoute = location.state?.isNewRoute;
  const initialRouteName = location.state?.routeName || 'Route A';
  const [points, setPoints] = useState<RoutePoint[]>([{ easting: '', northing: '' }]);
  const [routeId, setRouteId] = useState<string | undefined>(undefined);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [routeName, setRouteName] = useState<string>(initialRouteName);
  // Track point_ids to delete
  const [pointsToDelete, setPointsToDelete] = useState<string[]>([]);

  // Fetch routes on mount if applicationId is present
  useEffect(() => {
    if (effectiveApplicationId) {
      fetchRoutes(effectiveApplicationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveApplicationId]);

  // When routes change, set points and routeId from the first route (if any), unless adding a new route
  useEffect(() => {
    if (isNewRoute) {
      setRouteId(undefined);
      setRouteName(initialRouteName);
      setPoints([{ easting: '', northing: '', point_id: '' }]);
      return;
    }
    if (routes && routes.length > 0 && Array.isArray(routes[0].gridPoints) && routes[0].gridPoints.length > 0) {
      setRouteId(routes[0].route_id);
      setRouteName(routes[0].routeName || 'Route A');
      setPoints(
        routes[0].gridPoints.map((pt: any) => ({
          easting: String(pt.easting ?? ''),
          northing: String(pt.northing ?? ''),
          point_id: pt.point_id,
        }))
      );
    } else {
      setRouteId('');
      setRouteName('Route A');
      setPoints([{ easting: '', northing: '', point_id: '' }]);
    }
  }, [routes, isNewRoute, initialRouteName]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setValidationError(null);
    // Use validation function to determine first error
    let summaryError: string | undefined = undefined;
    for (const pt of points) {
      const err = getPointError(pt.easting, pt.northing);
      if (err) {
        summaryError = err;
        break;
      }
    }
    if (summaryError) {
      setValidationError(summaryError);
      setSubmitting(false);
      return;
    }
    if (!effectiveApplicationId) {
      setSubmitError('No application ID found in URL or query string.');
      setSubmitting(false);
      return;
    }
    try {
      if (!routeId) {
        // No routeId, create new route
        await createRoute(effectiveApplicationId, {
          route_id: '',
          routeName: routeName,
          gridPoints: points.map(pt => ({
            easting: Number(pt.easting),
            northing: Number(pt.northing),
            point_id:''
          })),
        });
      } else {
        // Existing route, save (update)
        await saveRoutes(effectiveApplicationId, [{
          route_id: routeId,
          routeName: routeName,
          gridPoints: points.map(pt => ({
            easting: Number(pt.easting),
            northing: Number(pt.northing),
            point_id: pt.point_id,
          })),
        }]);
      }
      // After save, delete points if any
      if (pointsToDelete.length > 0) {
        await deleteRoutePoints(pointsToDelete);
        setPointsToDelete([]); // Clear after successful delete
      }
      navigate(`/route-overview/${effectiveApplicationId}`);
    } catch (err) {
      setSubmitError('Failed to submit route points. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPoint = (idx: number, direction: 'before' | 'after') => {
    setPoints(prev => {
      const newPoint: RoutePoint = { easting: '', northing: '', route_id: routeId };
      const newPoints = [...prev];
      if (direction === 'before') {
        newPoints.splice(idx, 0, newPoint);
      } else {
        newPoints.splice(idx + 1, 0, newPoint);
      }
      return newPoints;
    });
    // Optionally update store if you want to keep in sync
  };

  const handleRemovePoint = (idx: number) => {
    setPoints(prev => {
      if (prev.length === 1) {
        // Only one box left: clear its values, but keep the box
        const removed = prev[0];
        if (removed.point_id) {
          setPointsToDelete(ids => [...ids, removed.point_id!]);
        }
        return [{ easting: '', northing: '', point_id: '' }];
      } else {
        const removed = prev[idx];
        if (removed.point_id) {
          setPointsToDelete(ids => [...ids, removed.point_id!]);
        }
        return prev.filter((_, i) => i !== idx);
      }
    });
  };

  const handleChange = (idx: number, field: 'easting' | 'northing', value: string) => {
    setPoints(prev => prev.map((pt, i) => i === idx ? { ...pt, [field]: value } : pt));
    // Optionally update store if you want to keep in sync
  };

  return (
    <ErrorBoundary>
      <div className="govuk-width-container">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <a className="govuk-breadcrumbs__link" href={`/frontend/task-list?id=${effectiveApplicationId}`}>Task list</a>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="page">{routeName}</li>
          </ol>
        </nav>
        {/* Validation error summary */}
        {validationError && (
          <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title" tabIndex={-1}>
            <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
            <ul className="govuk-list govuk-error-summary__list">
              <li><a href="#eip-add-route-easting" className="govuk-link govuk-error-message">{validationError}</a></li>
            </ul>
          </div>
        )}
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h1 className="govuk-heading-xl">{routeName}</h1>
              <div className="govuk-inset-text">
                You can{' '}
                <a
                  href={`/frontend/route-guidance?id=${effectiveApplicationId}`}
                  className="govuk-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  read the guidance on adding a route.
                </a>
              </div>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <form method="post" data-module="fds-html-form">
                    {/* Hidden CSRF or other fields can go here if needed */}
                    <div data-module="eip-add-route" className="eip-add-route">
                      {points.map((point, idx) => {
                        // Use validation function for each point
                        const errorMsg = validationError ? getPointError(point.easting, point.northing) : undefined;
                        return (
                          <RoutePointCard
                            key={point.point_id || idx}
                            point={point}
                            idx={idx}
                            error={errorMsg}
                            onAddBefore={() => handleAddPoint(idx, 'before')}
                            onAddAfter={() => handleAddPoint(idx, 'after')}
                            onRemove={() => handleRemovePoint(idx)}
                            onChange={(field, value) => handleChange(idx, field, value)}
                            onFocus={() => setSelectedIdx(idx)}
                          />
                        );
                      })}
                    </div>
                    <div className="govuk-!-static-margin-top-6">
                      <button
                        className="govuk-button"
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting...' : 'Submit'}
                      </button>
                      {submitError && (
                        <div className="govuk-error-message govuk-!-margin-top-2">{submitError}</div>
                      )}
                    </div>
                  </form>
                 
                </div>
                <div className="govuk-grid-column-one-half eip-sticky-column">
                  {/* Removed IE warning message */}
                  <div data-module="eip-hide-if-ie">
                    <div className="eip-map__container">
                      <SensitiveAreaCheckMap
                        points={points}
                        selectedIdx={selectedIdx}
                        setPoints={setPoints}
                        setSelectedIdx={setSelectedIdx}
                        routeName={location.state?.routeName || 'Route'}
                        mode="edit"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default RouteMapPage;
