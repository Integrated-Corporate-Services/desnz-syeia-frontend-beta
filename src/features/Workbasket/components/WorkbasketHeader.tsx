import React from 'react';
import StartNewApplicationButton from '../../../components/StartNewApplicationButton';

interface WorkbasketHeaderProps {
  onToggleFilters: () => void;
  showFilters: boolean;
  onDashboardClick?: () => void;
  showDashboard?: boolean;
}

export const WorkbasketHeader: React.FC<WorkbasketHeaderProps> = ({
  onToggleFilters,
  showFilters,
  onDashboardClick,
  showDashboard = false,
}) => {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-one-half">
        <h1 className="govuk-heading-l">Your applications</h1>
      </div>
      <div 
        className="govuk-grid-column-one-half" 
        style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: '10px' 
        }}
      >
        {showDashboard && onDashboardClick && (
          <button
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
            onClick={onDashboardClick}
            style={{ whiteSpace: 'nowrap' }}
          >
            Dashboard
          </button>
        )}
        
        <button
          className="govuk-button govuk-button--secondary"
          data-module="govuk-button"
          style={{ whiteSpace: 'nowrap' }}
          onClick={onToggleFilters}
        >
          {showFilters ? 'Hide filters' : 'Show filters'}
        </button>
        
        <StartNewApplicationButton />
      </div>
    </div>
  );
};
