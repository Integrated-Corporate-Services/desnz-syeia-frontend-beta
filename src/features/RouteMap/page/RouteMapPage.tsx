import React, { useState } from 'react';
import SensitiveAreaCheckMap, { RoutePoint } from '../../../components/SensitiveAreaCheckMap';
import RoutePointCard from '../component/RoutePointCard';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { submitRoutePoints } from '../../../services/routeMapService';

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

const RouteMapPage: React.FC = () => {
  const location = useLocation();
  const [points, setPoints] = useState<RoutePoint[]>(() => {
    const prefillPoints = location.state?.gridPoints;
    return Array.isArray(prefillPoints) && prefillPoints.length > 0
      ? prefillPoints
      : [{ easting: '', northing: '' }];
  });

  React.useEffect(() => {
    const prefillPoints = location.state?.gridPoints;
    if (Array.isArray(prefillPoints) && prefillPoints.length > 0) {
      setPoints(prefillPoints);
    }
  }, [location.state?.gridPoints]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { applicationId: paramId } = useParams<{ applicationId: string }>();
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');
  const stateId = location.state?.applicationId;
  const effectiveApplicationId = paramId || queryId || stateId || '';

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    if (!effectiveApplicationId) {
      setSubmitError('No application ID found in URL or query string.');
      setSubmitting(false);
      return;
    }
    try {
  await submitRoutePoints(effectiveApplicationId, points);
  navigate(`/route-overview/${effectiveApplicationId}`);
    } catch (err) {
      setSubmitError('Failed to submit route points. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPoint = (idx: number, direction: 'before' | 'after') => {
    setPoints(prev => {
      const newPoint: RoutePoint = { easting: '', northing: '' };
      const newPoints = [...prev];
      if (direction === 'before') {
        newPoints.splice(idx, 0, newPoint);
      } else {
        newPoints.splice(idx + 1, 0, newPoint);
      }
      return newPoints;
    });
  };

  const handleRemovePoint = (idx: number) => {
    setPoints(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  };

  const handleChange = (idx: number, field: 'easting' | 'northing', value: string) => {
    setPoints(prev => prev.map((pt, i) => i === idx ? { ...pt, [field]: value } : pt));
  };

  return (
    <ErrorBoundary>
      <div className="govuk-width-container">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <a className="govuk-breadcrumbs__link" href={`/frontend/task-list?id=${effectiveApplicationId}`}>Task list</a>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="page">Route A</li>
          </ol>
        </nav>
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h1 className="govuk-heading-xl">Route A</h1>
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
                      {points.map((point, idx) => (
                        <RoutePointCard
                          key={idx}
                          point={point}
                          idx={idx}
                          onAddBefore={() => handleAddPoint(idx, 'before')}
                          onAddAfter={() => handleAddPoint(idx, 'after')}
                          onRemove={() => handleRemovePoint(idx)}
                          onChange={(field, value) => handleChange(idx, field, value)}
                          onFocus={() => setSelectedIdx(idx)}
                        />
                      ))}
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