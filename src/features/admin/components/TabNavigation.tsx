import React from 'react';

interface TabNavigationProps {
  activeTab: 'organisations' | 'active-users' | 'pending-requests';
  pendingCount: number;
  onTabChange: (tab: 'organisations' | 'active-users' | 'pending-requests') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  pendingCount,
  onTabChange
}) => {
  return (
    <div className="govuk-tabs" data-module="govuk-tabs">
      <h2 className="govuk-tabs__title">Contents</h2>
      <ul className="govuk-tabs__list">
        <li className={`govuk-tabs__list-item ${activeTab === 'organisations' ? 'govuk-tabs__list-item--selected' : ''}`}>
          <a
            className="govuk-tabs__tab"
            href="#organisations"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('organisations');
            }}
          >
            Organisations
          </a>
        </li>
        <li className={`govuk-tabs__list-item ${activeTab === 'active-users' ? 'govuk-tabs__list-item--selected' : ''}`}>
          <a
            className="govuk-tabs__tab"
            href="#active-users"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('active-users');
            }}
          >
            Active users
          </a>
        </li>
        <li className={`govuk-tabs__list-item ${activeTab === 'pending-requests' ? 'govuk-tabs__list-item--selected' : ''}`}>
          <a
            className="govuk-tabs__tab"
            href="#pending-requests"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('pending-requests');
            }}
          >
            Pending access requests ({pendingCount})
          </a>
        </li>
      </ul>
    </div>
  );
};
