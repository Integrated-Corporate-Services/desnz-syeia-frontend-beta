import React from "react";
import { TAB_OPTIONS, TabType } from "../constants/filterOptions";
import "../../../styles/DashboardMobile.css";

interface ApplicationDashboardTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: Record<TabType, number>;
}

export const ApplicationDashboardTabs: React.FC<ApplicationDashboardTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  /**
   * Handle keyboard navigation (Left/Right arrows, Home/End)
   * GDS Pattern: Manual activation with keyboard support
   */
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let targetIndex: number;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        targetIndex =
          currentIndex > 0 ? currentIndex - 1 : TAB_OPTIONS.length - 1;
        break;
      case "ArrowRight":
        e.preventDefault();
        targetIndex =
          currentIndex < TAB_OPTIONS.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        e.preventDefault();
        targetIndex = 0;
        break;
      case "End":
        e.preventDefault();
        targetIndex = TAB_OPTIONS.length - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onTabChange(TAB_OPTIONS[currentIndex].value);
        return;
      default:
        return;
    }

    // Focus the target tab (but don't activate until Enter/Space)
    const targetTab = document.querySelector(
      `[data-tab-index="${targetIndex}"]`,
    ) as HTMLElement;
    targetTab?.focus();
  };

  return (
    <div className="govuk-tabs" data-module="govuk-tabs">
      <h2 className="govuk-visually-hidden">Application status tabs</h2>
      <ul className="govuk-tabs__list" role="tablist">
        {TAB_OPTIONS.map((tab, index) => (
          <li
            key={tab.value}
            className={`govuk-tabs__list-item ${
              activeTab === tab.value ? "govuk-tabs__list-item--selected" : ""
            }`}
            role="presentation"
          >
            <a
              className="govuk-tabs__tab govuk-!-font-size-19"
              href={`#${tab.value}`}
              role="tab"
              aria-selected={activeTab === tab.value}
              aria-controls={`${tab.value}-panel`}
              tabIndex={activeTab === tab.value ? 0 : -1}
              data-tab-index={index}
              onClick={(e) => {
                e.preventDefault();
                onTabChange(tab.value);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {tab.label.replace(/\s*\(.*\)\s*$/, "")} ({counts[tab.value]})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
