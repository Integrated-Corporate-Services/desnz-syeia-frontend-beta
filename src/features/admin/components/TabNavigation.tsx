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
  const tabs: { value: TabNavigationProps['activeTab']; label: string }[] = [
    ...(organisationsEnabled ? [{ value: 'organisations' as const, label: 'Organisations' }] : []),
    { value: 'active-users' as const, label: 'Active users' },
    { value: 'pending-requests' as const, label: `Pending access requests (${pendingCount})` },
  ];

  /**
   * Handle keyboard navigation (Left/Right arrows, Home/End)
   * GDS Pattern: Manual activation with keyboard support - matches ApplicationDashboardTabs.tsx
   */
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let targetIndex: number;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        targetIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        targetIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        targetIndex = tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onTabChange(tabs[currentIndex].value);
        return;
      default:
        return;
    }

    // Focus the target tab (but don't activate until Enter/Space)
    const targetTab = document.querySelector(
      `[data-tab-group="user-management"][data-tab-index="${targetIndex}"]`,
    ) as HTMLElement;
    targetTab?.focus();
  };

  return (
    <div className="govuk-tabs govuk-!-margin-top-0" data-module="govuk-tabs" style={style}>
      <ul className="govuk-tabs__list" role="tablist">
        {tabs.map((tab, index) => (
          <li
            key={tab.value}
            className={`govuk-tabs__list-item ${activeTab === tab.value ? 'govuk-tabs__list-item--selected' : ''}`}
            role="presentation"
          >
            <a
              className="govuk-tabs__tab"
              id={`${tab.value}-tab`}
              href={`#${tab.value}`}
              role="tab"
              aria-selected={activeTab === tab.value}
              aria-controls={tab.value}
              tabIndex={activeTab === tab.value ? 0 : -1}
              data-tab-index={index}
              data-tab-group="user-management"
              onClick={(e) => { e.preventDefault(); onTabChange(tab.value); }}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};