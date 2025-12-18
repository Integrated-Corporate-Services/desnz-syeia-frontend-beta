import React from 'react';

interface LoadingSkeletonProps {
  type?: 'summary' | 'table' | 'default';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'default' }) => {
  if (type === 'summary') {
    return (
      <div className="govuk-!-margin-bottom-6">
        <div className="govuk-inset-text" style={{ backgroundColor: '#f3f2f1' }}>
          <p className="govuk-body">Loading...</p>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="govuk-inset-text" style={{ backgroundColor: '#f3f2f1' }}>
        <p className="govuk-body">Loading table data...</p>
      </div>
    );
  }

  return (
    <div className="govuk-inset-text" style={{ backgroundColor: '#f3f2f1' }}>
      <p className="govuk-body">Loading...</p>
    </div>
  );
};

export default LoadingSkeleton;
