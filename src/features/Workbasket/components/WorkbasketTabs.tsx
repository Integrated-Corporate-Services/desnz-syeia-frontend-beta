import React from "react";
import { TAB_OPTIONS, TabType } from "../constants/filterOptions";

interface WorkbasketTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: Record<TabType, number>;
}

export const WorkbasketTabs: React.FC<WorkbasketTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  return (
    <div className="govuk-tabs" data-module="govuk-tabs">
      <h2 className="govuk-visually-hidden">Application status tabs</h2>
      <ul className="govuk-tabs__list" role="tablist">
        {TAB_OPTIONS.map((tab) => (
          <li
            key={tab.value}
            className={`govuk-tabs__list-item ${
              activeTab === tab.value ? "govuk-tabs__list-item--selected" : ""
            }`}
            role="presentation"
          >
            <a
              className="govuk-tabs__tab"
              href={`#${tab.value}`}
              role="tab"
              aria-selected={activeTab === tab.value}
              aria-controls={`${tab.value}-panel`}
              tabIndex={activeTab === tab.value ? 0 : -1}
              onClick={(e) => {
                e.preventDefault();
                onTabChange(tab.value);
              }}
            >
              {tab.label} ({counts[tab.value]})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
