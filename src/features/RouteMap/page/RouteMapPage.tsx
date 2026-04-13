import React, { useState, useEffect } from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { Link } from 'react-router-dom';
import SensitiveAreaCheckMap, { RoutePoint as BaseRoutePoint } from '../../../components/SensitiveAreaCheckMap';
import ErrorBoundary from '../../../components/ErrorBoundary';
import RoutePointCard from '../component/RoutePointCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRouteStore } from '../../../store/useRouteStore';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { getNextRouteName } from '../../../utils/routeNamingUtils';

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

// Check for duplicate coordinates
// function checkDuplicatePoints(points: RoutePoint[]): string | undefined {
//   const coordinates = new Set<string>();
//   for (let i = 0; i < points.length; i++) {
//     const pt = points[i];
//     // Skip validation for empty points
//     if (!pt.easting || !pt.northing) continue;
    
//     const coordKey = `${pt.easting},${pt.northing}`;
//     if (coordinates.has(coordKey)) {
//       return `Point ${i + 1} has duplicate coordinates. Each point must have unique coordinates to create a valid route.`;
//     }
//     coordinates.add(coordKey);
//   }
//   return undefined;
// }

// Extend RoutePoint to include point_id and route_id
interface RoutePoint extends BaseRoutePoint {
  point_id?: string;
  route_id?: string;
}

const RouteMapPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
    const applicationId = useGetApplicationId();
  

  const effectiveApplicationId = applicationId 

  // Store
  const { routes, loading, error, fetchRoutes, createRoute, saveRoutes, deleteRoutePoints } = useRouteStore();
  
  // If coming from add new route, use blank state and provided routeName
  const isNewRoute = location.state?.isNewRoute;
  const initialRouteName = location.state?.routeName || (isNewRoute ? getNextRouteName([]) : 'Route A');
  const details = location.state?.details || '';
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
      // Calculate the next route name only if no routeName was explicitly passed in location.state
      const nextRouteName = location.state?.routeName || getNextRouteName(routes.map(r => r.routeName));
      setRouteName(nextRouteName);
      setPoints([{ easting: '', northing: '', point_id: '' }]);
      return;
    }
    // If editing, find the correct route by route_id from location.state
    const editRouteId = location.state?.route_id;
    let routeToEdit = null;
    if (editRouteId && routes && routes.length > 0) {
      routeToEdit = routes.find(r => r.route_id === editRouteId);
    }
    // Fallback to first route if not editing a specific one
    if (!routeToEdit && routes && routes.length > 0 && Array.isArray(routes[0].gridPoints) && routes[0].gridPoints.length > 0) {
      routeToEdit = routes[0];
    }
    if (routeToEdit && Array.isArray(routeToEdit.gridPoints) && routeToEdit.gridPoints.length > 0) {
      setRouteId(routeToEdit.route_id);
      setRouteName(routeToEdit.routeName || 'Route A');
      setPoints(
        routeToEdit.gridPoints.map((pt: any) => ({
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
  }, [routes, isNewRoute, initialRouteName, location.state]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setValidationError(null);
    // Use validation function to determine first error
    let summaryError: string | undefined = undefined;
    
    // Check each point for validation errors
    for (const pt of points) {
      const err = getPointError(pt.easting, pt.northing);
      if (err) {
        summaryError = err;
        break;
      }
    }
    
    // Check for duplicate coordinates - DISABLED to allow duplicate points within a route
    // if (!summaryError) {
    //   summaryError = checkDuplicatePoints(points);
    // }
    
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
          disconnectedroute_justification: details
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
          disconnectedroute_justification: details
        }]);
      }
      // After save, delete points if any
      if (pointsToDelete.length > 0 && effectiveApplicationId) {
        await deleteRoutePoints(effectiveApplicationId, pointsToDelete);
        setPointsToDelete([]); // Clear after successful delete
      }
  navigate(`${S37_BASE_URL}/${effectiveApplicationId}/route-overview`);
    } catch (err) {
      setSubmitError('Failed to submit route points. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPoint = (idx: number, direction: 'before' | 'after') => {
  setSubmitError(null);
    setValidationError(null); // Clear validation error before adding
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
    setSubmitError(null);
    setValidationError(null);
    setPoints(prev => prev.map((pt, i) => i === idx ? { ...pt, [field]: value } : pt));
    setSelectedIdx(idx); // Keep focus on the same box after change
    // Optionally update store if you want to keep in sync
  };

  return (
      <div className="govuk-width-container">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${effectiveApplicationId}/task-list`}>
                Task list
              </Link>
            </li>
            {routes.length > 0 && (
              <li className="govuk-breadcrumbs__list-item">
                <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${effectiveApplicationId}/route-overview`}>
                  Route overview
                </Link>
              </li>
            )}
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
              <div className='govuk-grid-column-three-quarters'>  
              <p className="govuk-body">
                Enter the points where your route starts, changes direction and ends by adding <b>new</b> coordinates before or after the previous point. Submit your route after you have entered all of the points.
              </p>
              <div className="govuk-inset-text">
                <Link
                  className="govuk-link"
                  to={`${S37_BASE_URL}/${effectiveApplicationId}/route-guidance`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the guidance on adding a route or a route spur
                </Link>
              </div>
              </div>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <form method="post" data-module="fds-html-form">
                    {/* Hidden CSRF or other fields can go here if needed */}
                    <fieldset className="govuk-fieldset" aria-describedby="route-points-hint">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m" style={{ marginBottom: 0 }}>
                        <span className="govuk-visually-hidden">Route points</span>
                      </legend>
                   
                      <div className="govuk-form-group govuk-!-margin-top-4" style={{ padding: 0 }}>
                        <div className="govuk-box-highlight govuk-!-margin-bottom-4" style={{ border: '1px solid #b1b4b6', borderRadius: 0, padding: 0 }}>
                          {(() => {
                            // Find the first invalid point index after submit
                            let firstInvalidIdx: number | null = null;
                            if (validationError) {
                              for (let i = 0; i < points.length; i++) {
                                const err = getPointError(points[i].easting, points[i].northing);
                                if (err) {
                                  firstInvalidIdx = i;
                                  break;
                                }
                              }
                            }
                            return points.map((point, idx) => {
                              let errorMsg: string | undefined = undefined;
                              if (validationError && idx === firstInvalidIdx) {
                                errorMsg = getPointError(point.easting, point.northing);
                              }
                              // Use a stable key for each point: point_id if present, else idx
                              const stableKey = point.point_id || idx;
                              return (
                                <RoutePointCard
                                  key={stableKey}
                                  point={point}
                                  idx={idx}
                                  error={errorMsg}
                                  onAddBefore={() => handleAddPoint(idx, 'before')}
                                  onAddAfter={() => handleAddPoint(idx, 'after')}
                                  onRemove={() => handleRemovePoint(idx)}
                                  onChange={(field, value) => handleChange(idx, field, value)}
                                  onFocus={() => setSelectedIdx(idx)}
                                  isSelected={selectedIdx === idx}
                                />
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </fieldset>
                    <div className="govuk-!-margin-top-6">
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
                      <ErrorBoundary>
                        <SensitiveAreaCheckMap
                          points={points}
                          selectedIdx={selectedIdx}
                          setPoints={setPoints}
                          setSelectedIdx={setSelectedIdx}
                          routeName={location.state?.routeName || 'Route'}
                          mode="edit"
                        />
                      </ErrorBoundary>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
};

export default RouteMapPage;
