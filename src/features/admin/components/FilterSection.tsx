import React from 'react';

interface FilterSectionProps {
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  showFilters,
  onToggleFilters
}) => {
  return (
    <>
      <button
        type="button"
        className="govuk-button govuk-!-margin-bottom-4"
        onClick={onToggleFilters}
      >
        {showFilters ? 'Hide filter' : 'Show filter'}
      </button>

      {showFilters && (
        <div className="govuk-form-group govuk-!-margin-bottom-6">
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
              Filter by
            </legend>
            <div className="govuk-checkboxes govuk-checkboxes--small">
              <div className="govuk-checkboxes__item">
                <input className="govuk-checkboxes__input" id="filter-organisation" name="filter" type="checkbox" value="organisation" />
                <label className="govuk-label govuk-checkboxes__label" htmlFor="filter-organisation">
                  Organisation
                </label>
              </div>
              <div className="govuk-checkboxes__item">
                <input className="govuk-checkboxes__input" id="filter-status" name="filter" type="checkbox" value="status" />
                <label className="govuk-label govuk-checkboxes__label" htmlFor="filter-status">
                  Status
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      )}
    </>
  );
};
