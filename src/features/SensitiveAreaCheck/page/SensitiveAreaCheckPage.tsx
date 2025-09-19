import React, { useState } from 'react';
import SensitiveAreaCheckMap, { RoutePoint } from '../component/SensitiveAreaCheckMap';
import RoutePointCard from '../component/RoutePointCard';

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

const SensitiveAreaCheckPage: React.FC = () => {
  const [points, setPoints] = useState<RoutePoint[]>([
    { easting: '', northing: '' }
  ]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

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
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full-width">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Create a route</h1>
          <div className="govuk-inset-text">
            You can <a href="#" className="govuk-link">read the guidance on adding a route</a>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
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
            <div className="govuk-grid-column-one-half">
              <SensitiveAreaCheckMap
                points={points}
                selectedIdx={selectedIdx}
                setPoints={setPoints}
                setSelectedIdx={setSelectedIdx}
              />
            </div>
          </div>
          {/* Call to action buttons */}
          <div className="govuk-!-static-margin-top-6">
            <a href="../consultation/map-search.html" className="govuk-button">Submit and continue</a>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SensitiveAreaCheckPage;