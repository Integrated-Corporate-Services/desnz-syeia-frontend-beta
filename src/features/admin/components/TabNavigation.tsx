import React from 'react';
import '../../../styles/TabNavigation.css';

interface TabNavigationProps {
  activeTab: 'organisations' | 'active-users' | 'pending-requests';
  organisationsEnabled: boolean;
  pendingCount: number;
  onTabChange: (tab: 'organisations' | 'active-users' | 'pending-requests') => void;
  style?: React.CSSProperties;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  organisationsEnabled,
  pendingCount, 
  onTabChange,
  style 
}) => {
  return (
    <div className="govuk-tabs govuk-!-margin-top-0" data-module="govuk-tabs" style={style}>
      <ul className="govuk-tabs__list" role="tablist">
        {organisationsEnabled && (
          <li className={`govuk-tabs__list-item ${activeTab === 'organisations' ? 'govuk-tabs__list-item--selected' : ''}`} role="presentation">
            <a
              className="govuk-tabs__tab"
              id="organisations-tab"
              href="#organisations"
              role="tab"
              aria-selected={activeTab === 'organisations'}
              aria-controls="organisations"
              onClick={(e) => { e.preventDefault(); onTabChange('organisations'); }}
            >
              Organisations
            </a>
          </li>
        )}
        <li className={`govuk-tabs__list-item ${activeTab === 'active-users' ? 'govuk-tabs__list-item--selected' : ''}`} role="presentation">
          <a
            className="govuk-tabs__tab"
            id="active-users-tab"
            href="#active-users"
            role="tab"
            aria-selected={activeTab === 'active-users'}
            aria-controls="active-users"
            onClick={(e) => { e.preventDefault(); onTabChange('active-users'); }}
          >
            Active users
          </a>
        </li>
        <li className={`govuk-tabs__list-item ${activeTab === 'pending-requests' ? 'govuk-tabs__list-item--selected' : ''}`} role="presentation">
          <a
            className="govuk-tabs__tab"
            id="pending-requests-tab"
            href="#pending-requests"
            role="tab"
            aria-selected={activeTab === 'pending-requests'}
            aria-controls="pending-requests"
            onClick={(e) => { e.preventDefault(); onTabChange('pending-requests'); }}
          >
            Pending access requests ({pendingCount})
          </a>
        </li>
      </ul>
    </div>
  );
};