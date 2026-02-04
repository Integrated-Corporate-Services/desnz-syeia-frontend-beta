import React from "react";
import SearchResults from "./SearchResults";
import { useCompanySearch } from "../../../../hooks/useCompanySearch";
import { CompanySearchResult } from "../../../../types/companiesHouse";

interface CompaniesHouseSearchProps {
  onCompanySelect: (company: CompanySearchResult | null) => void;
  onError?: (error: string) => void; // New prop for propagating errors
  initialValue?: string;
  label?: string;
  hint?: string;
}

const CompaniesHouseSearch: React.FC<CompaniesHouseSearchProps> = ({
  onCompanySelect,
  onError,
  initialValue = "",
  label = "",
  hint,
}) => {
  const { state, actions } = useCompanySearch();
  const { results, isLoading, error, hasSearched } = state;
  const { performSearch } = actions;

  // Propagate error to parent whenever it changes
  React.useEffect(() => {
    if (onError) {
      onError(error || "");
    }
  }, [error, onError]);

  // Local state for the input field to allow typing before searching
  const [inputValue, setInputValue] = React.useState(initialValue);
  const [selectedCompany, setSelectedCompany] =
    React.useState<CompanySearchResult | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(inputValue);
  };

  const handleSelect = (company: CompanySearchResult) => {
    setInputValue(company.title);
    setSelectedCompany(company);
    onCompanySelect(company);
  };

  const handleChangeSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedCompany(null);
    setInputValue("");
    onCompanySelect(null); // Clear parent state
  };

  if (selectedCompany) {
    return (
      <div className="govuk-form-group">
        {label && <label className="govuk-label govuk-label--l">{label}</label>}

        <div className="govuk-inset-text">
          <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">
            {selectedCompany.title}
          </p>
          <p className="govuk-body govuk-!-margin-bottom-1">
            Company number: {selectedCompany.company_number}
          </p>
          <p className="govuk-body govuk-!-margin-bottom-3">
            {selectedCompany.address_snippet}
          </p>

          <a href="#" className="govuk-link" onClick={handleChangeSelection}>
            Change
            <span className="govuk-visually-hidden"> selected agency</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="company-search-container">
      <form onSubmit={handleSearch}>
        <div
          className={`govuk-form-group ${error ? "govuk-form-group--error" : ""}`}
        >
          <label
            className="govuk-label govuk-label--l"
            htmlFor="company-search"
          >
            {label}
          </label>
          {hint && (
            <div id="company-search-hint" className="govuk-hint">
              {hint}
            </div>
          )}
          {error && (
            <p className="govuk-error-message">
              <span className="govuk-visually-hidden">Error:</span> {error}
            </p>
          )}

          <div
            style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
          >
            <input
              className={`govuk-input ${error ? "govuk-input--error" : ""}`}
              id="company-search"
              name="company-search"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              style={{ maxWidth: "70%", width: "100%" }}
            />
            <button
              type="submit"
              className="govuk-button govuk-button--secondary"
              disabled={isLoading}
              style={{ marginBottom: 0 }}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {isLoading && (
        <div className="govuk-body">Searching specific company details...</div>
      )}

      {/* Show results if we have them and user hasn't selected a final value (or is searching again) */}
      {!isLoading && !error && results.length > 0 && (
        <SearchResults
          results={results}
          // When a user selects a company from the list
          onSelectCompany={handleSelect}
        />
      )}

      {!isLoading && !error && hasSearched && results.length === 0 && (
        <p className="govuk-body">
          No companies found. Check the name and try again.
        </p>
      )}
    </div>
  );
};

export default CompaniesHouseSearch;
