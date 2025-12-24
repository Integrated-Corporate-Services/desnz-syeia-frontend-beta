import React from 'react';

interface Filters {
  applicantType: 'all' | 'employee' | 'agent';
}

interface RequestFiltersProps {
  filters: Filters;
  onFilterChange: (filterName: string, value: string) => void;
}

export const RequestFilters: React.FC<RequestFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange('applicantType', e.target.value);
  };

  return (
    <details className="govuk-details govuk-!-margin-bottom-6" data-module="govuk-details">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          Filter requests
        </span>
      </summary>
      <div className="govuk-details__text">
        <div className="govuk-form-group">
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
              Applicant type
            </legend>
            <div className="govuk-radios" data-module="govuk-radios">
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="applicant-all"
                  name="applicantType"
                  type="radio"
                  value="all"
                  checked={filters.applicantType === "all"}
                  onChange={handleFilterChange}
                />
                <label className="govuk-label govuk-radios__label" htmlFor="applicant-all">
                  All applicants
                </label>
              </div>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="applicant-employee"
                  name="applicantType"
                  type="radio"
                  value="employee"
                  checked={filters.applicantType === "employee"}
                  onChange={handleFilterChange}
                />
                <label className="govuk-label govuk-radios__label" htmlFor="applicant-employee">
                  Employees only
                </label>
              </div>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="applicant-agent"
                  name="applicantType"
                  type="radio"
                  value="agent"
                  checked={filters.applicantType === "agent"}
                  onChange={handleFilterChange}
                />
                <label className="govuk-label govuk-radios__label" htmlFor="applicant-agent">
                  Agents only
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </details>
  );
};

interface ResultsSummaryProps {
  filteredCount: number;
  totalCount: number;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  filteredCount,
  totalCount
}) => (
  <p className="govuk-body-s govuk-!-margin-bottom-4">
    Showing {filteredCount} of {totalCount} requests
  </p>
);
