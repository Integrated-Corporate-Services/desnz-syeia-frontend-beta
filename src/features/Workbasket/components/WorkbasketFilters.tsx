import React from "react";
import { CASE_TYPE_OPTIONS, STATUS_OPTIONS } from "../constants/filterOptions";

interface WorkbasketFiltersProps {
  showFilters: boolean;
  searchText: string;
  submittedBy: "me" | "all";
  caseTypes: string[];
  statuses: string[];
  onSearchChange: (value: string) => void;
  onSubmittedByChange: (value: "me" | "all") => void;
  onCaseTypeToggle: (caseType: string) => void;
  onStatusToggle: (status: string) => void;
  onApplyFilters: () => void;
}

export const WorkbasketFilters: React.FC<WorkbasketFiltersProps> = ({
  showFilters,
  searchText,
  submittedBy,
  caseTypes,
  statuses,
  onSearchChange,
  onSubmittedByChange,
  onCaseTypeToggle,
  onStatusToggle,
  onApplyFilters,
}) => {
  if (!showFilters) return null;

  return (
    <>
      <h2 className="govuk-heading-m">Filter</h2>

      {/* Search */}
      <div className="govuk-form-group">
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
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Submitted by */}
      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">
            Submitted by
          </legend>
          <div className="govuk-radios govuk-radios--small">
            <div className="govuk-radios__item">
              <input
                className="govuk-radios__input"
                id="submitted-me"
                name="submitted-by"
                type="radio"
                value="me"
                checked={submittedBy === "me"}
                onChange={() => onSubmittedByChange("me")}
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
                checked={submittedBy === "all"}
                onChange={() => onSubmittedByChange("all")}
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

      {/* Case type */}
      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">
            Case type
          </legend>
          <div className="govuk-checkboxes govuk-checkboxes--small">
            {CASE_TYPE_OPTIONS.map((option) => (
              <div key={option.value} className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id={`case-type-${option.value}`}
                  name="case-type"
                  type="checkbox"
                  value={option.value}
                  checked={caseTypes.includes(option.value)}
                  onChange={() => onCaseTypeToggle(option.value)}
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

      {/* Status of application */}
      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">
            Status of application
          </legend>
          <div className="govuk-checkboxes govuk-checkboxes--small">
            {STATUS_OPTIONS.map((option) => (
              <div key={option.value} className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id={`status-${option.value}`}
                  name="status"
                  type="checkbox"
                  value={option.value}
                  checked={statuses.includes(option.value)}
                  onChange={() => onStatusToggle(option.value)}
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

      <button
        className="govuk-button"
        data-module="govuk-button"
        onClick={onApplyFilters}
      >
        Apply filters
      </button>
    </>
  );
};
