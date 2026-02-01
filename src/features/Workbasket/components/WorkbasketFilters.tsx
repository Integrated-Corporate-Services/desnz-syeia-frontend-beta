import React, { useMemo, useState, useEffect } from "react";
import { CASE_TYPE_OPTIONS, STATUS_OPTIONS } from "../constants/filterOptions";
import "../../../styles/Workbasket.css";

interface WorkbasketFiltersProps {
  showFilters: boolean;
  searchText: string;
  submittedBy: "me" | "all";
  caseTypes: string[];
  statuses: string[];
  showSubmittedByFilter?: boolean;
  onSearchChange: (value: string) => void;
  onSubmittedByChange: (value: "me" | "all") => void;
  onCaseTypeToggle: (caseType: string) => void;
  onStatusToggle: (status: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const WorkbasketFilters: React.FC<WorkbasketFiltersProps> = ({
  showFilters,
  searchText,
  submittedBy,
  caseTypes,
  statuses,
  showSubmittedByFilter = true,
  onSearchChange,
  onSubmittedByChange,
  onCaseTypeToggle,
  onStatusToggle,
  onApplyFilters,
  onClearFilters,
}) => {
  const [localSearchText, setLocalSearchText] = useState(searchText);
  const [localSubmittedBy, setLocalSubmittedBy] = useState(submittedBy);
  const [localCaseTypes, setLocalCaseTypes] = useState<string[]>(caseTypes);
  const [localStatuses, setLocalStatuses] = useState<string[]>(statuses);

  useEffect(() => {
    setLocalSearchText(searchText);
    setLocalSubmittedBy(submittedBy);
    setLocalCaseTypes(caseTypes);
    setLocalStatuses(statuses);
  }, [searchText, submittedBy, caseTypes, statuses]);

  const handleLocalCaseTypeToggle = (caseType: string) => {
    setLocalCaseTypes((prev) =>
      prev.includes(caseType)
        ? prev.filter((t) => t !== caseType)
        : [...prev, caseType],
    );
  };

  const handleLocalStatusToggle = (status: string) => {
    setLocalStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handleApplyFilters = () => {
    onSearchChange(localSearchText);
    onSubmittedByChange(localSubmittedBy);

    // Apply case type changes
    const caseTypesToAdd = localCaseTypes.filter(
      (ct) => !caseTypes.includes(ct),
    );
    const caseTypesToRemove = caseTypes.filter(
      (ct) => !localCaseTypes.includes(ct),
    );
    caseTypesToAdd.forEach((ct) => onCaseTypeToggle(ct));
    caseTypesToRemove.forEach((ct) => onCaseTypeToggle(ct));

    // Apply status changes
    const statusesToAdd = localStatuses.filter((s) => !statuses.includes(s));
    const statusesToRemove = statuses.filter((s) => !localStatuses.includes(s));
    statusesToAdd.forEach((s) => onStatusToggle(s));
    statusesToRemove.forEach((s) => onStatusToggle(s));

    // Notify parent
    onApplyFilters();
  };

  /**
   * Clear all filters (both local and parent)
   */
  const handleClearFilters = () => {
    // Clear local state
    setLocalSearchText("");
    setLocalSubmittedBy("me");
    setLocalCaseTypes([]);
    setLocalStatuses([]);

    // Notify parent to clear
    onClearFilters();
  };

  const getFilterLabel = (
    type: "caseType" | "status",
    value: string,
  ): string => {
    switch (type) {
      case "caseType": {
        const option = CASE_TYPE_OPTIONS.find((opt) => opt.value === value);
        return option ? option.label : value;
      }
      case "status": {
        const option = STATUS_OPTIONS.find((opt) => opt.value === value);
        return option ? option.label : value;
      }
      default:
        return value;
    }
  };

  const stripBrackets = (label: string) => label.replace(/\s*\(.*\)\s*$/, "");

  const filterPills = useMemo(() => {
    const pills: Array<{
      id: string;
      type: "search" | "caseType" | "status" | "submittedBy";
      label: string;
      value: string;
    }> = [];

    if (localSearchText.trim()) {
      pills.push({
        id: "search",
        type: "search",
        label: `Search: ${localSearchText}`,
        value: localSearchText,
      });
    }

    localCaseTypes.forEach((caseType) => {
      let label = getFilterLabel("caseType", caseType);
      label = stripBrackets(label);
      pills.push({
        id: `case-type-${caseType}`,
        type: "caseType",
        label: label,
        value: caseType,
      });
    });

    localStatuses.forEach((status) => {
      const label = getFilterLabel("status", status);
      pills.push({
        id: `status-${status}`,
        type: "status",
        label: label,
        value: status,
      });
    });

    if (showSubmittedByFilter && localSubmittedBy === "all") {
      pills.push({
        id: "submitted-by",
        type: "submittedBy",
        label: "Submitted by: All users",
        value: "all",
      });
    }

    return pills;
  }, [
    localSearchText,
    localCaseTypes,
    localStatuses,
    localSubmittedBy,
    showSubmittedByFilter,
  ]);

  /**
   * Handle removing a specific filter pill
   */
  // Remove pill from LOCAL state for immediate feedback
  const handleRemovePill = (pill: (typeof filterPills)[0]) => {
    switch (pill.type) {
      case "search":
        setLocalSearchText("");
        break;
      case "caseType":
        handleLocalCaseTypeToggle(pill.value);
        break;
      case "status":
        handleLocalStatusToggle(pill.value);
        break;
      case "submittedBy":
        setLocalSubmittedBy("me");
        break;
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleApplyFilters();
  };

  const hasActiveFilters =
    searchText.trim() !== "" ||
    caseTypes.length > 0 ||
    statuses.length > 0 ||
    (showSubmittedByFilter && submittedBy === "all");

  if (!showFilters) return null;

  return (
    <form
      onSubmit={handleFormSubmit}
      role="search"
      aria-label="Filter applications"
      className="filter-panel"
    >
      <h2 className="govuk-heading-m">Filter</h2>

      {filterPills.length > 0 && (
        <div
          className="selected-filters-container"
          data-testid="selected-filters"
        >
          <h3 className="govuk-heading-s">Selected filters</h3>
          <div className="filter-pills">
            {filterPills.map((pill) => (
              <span key={pill.id} className="filter-pill">
                <span>{pill.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePill(pill)}
                  aria-label={`Remove ${pill.label} filter`}
                  className="filter-pill-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="filter-actions">
        <button
          type="submit"
          className="govuk-button"
          data-module="govuk-button"
          aria-label="Apply selected filters"
        >
          Apply filters
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
            onClick={handleClearFilters}
            aria-label="Clear all filters and reset to default view"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="govuk-form-group filter-section">
        <label
          className="govuk-label govuk-!-font-weight-bold"
          htmlFor="search"
        >
          Search
        </label>
        <input
          className="govuk-input"
          id="search"
          name="search"
          type="text"
          value={localSearchText}
          onChange={(e) => setLocalSearchText(e.target.value)}
          autoComplete="off"
        />
      </div>

      {showSubmittedByFilter && (
        <div className="govuk-form-group filter-section">
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">
              Submitted by
            </legend>
            <div className="govuk-radios">
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="submitted-me"
                  name="submitted-by"
                  type="radio"
                  value="me"
                  checked={localSubmittedBy === "me"}
                  onChange={() => setLocalSubmittedBy("me")}
                />
                <label
                  className="govuk-label govuk-radios__label"
                  htmlFor="submitted-me"
                >
                  Me
                </label>
              </div>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="submitted-all"
                  name="submitted-by"
                  type="radio"
                  value="all"
                  checked={localSubmittedBy === "all"}
                  onChange={() => setLocalSubmittedBy("all")}
                />
                <label
                  className="govuk-label govuk-radios__label"
                  htmlFor="submitted-all"
                >
                  All users
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      )}

      {/* Case type */}
      <div className="govuk-form-group filter-section">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">
            Case type
          </legend>
          <div className="govuk-checkboxes">
            {CASE_TYPE_OPTIONS.map((option) => (
              <div key={option.value} className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id={`case-type-${option.value}`}
                  name="case-type"
                  type="checkbox"
                  value={option.value}
                  checked={localCaseTypes.includes(option.value)}
                  onChange={() => handleLocalCaseTypeToggle(option.value)}
                />
                <label
                  className="govuk-label govuk-checkboxes__label"
                  htmlFor={`case-type-${option.value}`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="govuk-form-group filter-section">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">
            Status
          </legend>
          <div className="govuk-checkboxes">
            {STATUS_OPTIONS.map((option) => (
              <div key={option.value} className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id={`status-${option.value}`}
                  name="status"
                  type="checkbox"
                  value={option.value}
                  checked={localStatuses.includes(option.value)}
                  onChange={() => handleLocalStatusToggle(option.value)}
                />
                <label
                  className="govuk-label govuk-checkboxes__label"
                  htmlFor={`status-${option.value}`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </form>
  );
};

// Display name for React DevTools
WorkbasketFilters.displayName = "WorkbasketFilters";
