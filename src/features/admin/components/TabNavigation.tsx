import React from 'react';
import '../../../styles/TabNavigation.css';

interface TabNavigationProps {
  activeTab: 'organisations' | 'active-users' | 'pending-requests';
  pendingCount: number;
  onTabChange: (tab: 'organisations' | 'active-users' | 'pending-requests') => void;
  style?: React.CSSProperties;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  pendingCount, 
  onTabChange,
  style 
}) => {
  return (
    <div className="govuk-tabs govuk-!-margin-top-0" data-module="govuk-tabs" style={style}>
      <ul className="govuk-tabs__list">
        <li className={`govuk-tabs__list-item ${activeTab === 'organisations' ? 'govuk-tabs__list-item--selected' : ''}`}>
          <a 
            className="govuk-tabs__tab" 
            href="#organisations" 
            onClick={(e) => e.preventDefault()}
            style={{ pointerEvents: 'none', opacity: 0.5 }}
          >
            Organisations
          </a>
        </li>
        <li className={`govuk-tabs__list-item ${activeTab === 'active-users' ? 'govuk-tabs__list-item--selected' : ''}`}>
          <a 
            className="govuk-tabs__tab" 
            href="#active-users"
            onClick={(e) => { e.preventDefault(); onTabChange('active-users'); }}
          >
            Active users
          </a>
        </li>
        <li className={`govuk-tabs__list-item ${activeTab === 'pending-requests' ? 'govuk-tabs__list-item--selected' : ''}`}>
          <a 
            className="govuk-tabs__tab" 
            href="#pending-requests"
            onClick={(e) => { e.preventDefault(); onTabChange('pending-requests'); }}
          >
            Pending access requests ({pendingCount})
          </a>
        </li>
      </ul>
    </div>
  );
};