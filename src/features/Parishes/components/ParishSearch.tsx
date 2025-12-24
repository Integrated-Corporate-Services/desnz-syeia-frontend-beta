import React from "react";
import { Parish } from "../types/Parish";

interface ParishSearchProps {
  searchTerm: string;
  searchResults: Parish[];
  isSearching: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddParish: (parish: Parish) => void;
}

const ParishSearch: React.FC<ParishSearchProps> = ({
  searchTerm,
  searchResults,
  isSearching,
  onSearchChange,
  onAddParish,
}) => {
  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor="parish-search">
        Add parish
      </label>
      <div id="parish-search-hint" className="govuk-hint">
        Find parishes by name, county or local planning authority
      </div>
      <input
        className="govuk-input"
        id="parish-search"
        name="parish-search"
        type="text"
        value={searchTerm}
        onChange={onSearchChange}
        aria-describedby="parish-search-hint"
        placeholder="Search for a parish"
      />
      {isSearching && (
        <div className="govuk-hint govuk-!-margin-top-2">
          Searching...
        </div>
      )}
      {searchResults.length > 0 && (
        <div className="govuk-!-margin-top-2" style={{ border: '1px solid #b1b4b6', maxHeight: '200px', overflowY: 'auto' }}>
          {searchResults.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => onAddParish(result)}
              className="govuk-link"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '10px',
                cursor: 'pointer'
              }}
            >
              {result.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParishSearch;
