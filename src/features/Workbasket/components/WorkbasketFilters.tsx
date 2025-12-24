import React from 'react';
import { STATUS_FILTER_OPTIONS, DATE_FILTER_OPTIONS } from '../constants/filterOptions';

interface WorkbasketFiltersProps {
  showFilters: boolean;
  statusFilter: string;
  dateFilter: string;
  searchText: string;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

export const WorkbasketFilters: React.FC<WorkbasketFiltersProps> = ({
  showFilters,
  statusFilter,
  dateFilter,
  searchText,
  onStatusChange,
  onDateChange,
  onSearchChange,
  onClearFilters,
}) => {
  if (!showFilters) return null;

  return (
    <div className="govuk-grid-row" style={{ marginBottom: '10px' }}>
      <div className="govuk-grid-column-full govuk-!-static-padding-top-2 govuk-!-static-margin-bottom-3" style={{ backgroundColor: '#f3f2f1' }}>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <h2 className="govuk-heading-m govuk-!-static-margin-bottom-2">Filters</h2>
            </div>
            <div className="govuk-grid-column-one-half" style={{ textAlign: 'right' }}>
              <a
                href="#"
                className="govuk-link"
                style={{ color: '#4c2c92' }}
                onClick={(e) => {
                  e.preventDefault();
                  onClearFilters();
                }}
              >
                Clear filters
              </a>
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group govuk-!-static-margin-bottom-4">
                <label className="govuk-label" htmlFor="status-filter">
                  Status
                </label>
                <select
                  className="govuk-select"
                  id="status-filter"
                  name="status"
                  value={statusFilter}
                  onChange={(e) => onStatusChange(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {STATUS_FILTER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group govuk-!-static-margin-bottom-4">
                <label className="govuk-label" htmlFor="date-filter">
                  Date
                </label>
                <select
                  className="govuk-select"
                  id="date-filter"
                  name="date"
                  value={dateFilter}
                  onChange={(e) => onDateChange(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {DATE_FILTER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group govuk-!-static-margin-bottom-4">
                <label className="govuk-label" htmlFor="search-filter">
                  Search
                </label>
                <input
                  className="govuk-input"
                  id="search-filter"
                  name="search"
                  type="text"
                  value={searchText}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="E.g. Reference, status"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};
