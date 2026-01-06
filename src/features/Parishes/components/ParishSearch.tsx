import React from "react";
import { Parish } from "../types/Parish";

interface ParishSearchProps {
  searchTerm: string;
  searchResults: Parish[];
  isSearching: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddParish: (parish: Parish) => void;
  error?: string | null;
}

const ParishSearch: React.FC<ParishSearchProps> = ({
  searchTerm,
  searchResults,
  isSearching,
  onSearchChange,
  onAddParish,
  error,
}) => {
  return (
    <div
      className={`govuk-form-group${error ? " govuk-form-group--error" : ""}`}
    >
      <label className="govuk-label govuk-label--m" htmlFor="parish-search">
        Add parish
      </label>
      <div id="parish-search-hint" className="govuk-hint">
        Find parishes by name, county or local planning authority
      </div>
      {error && (
        <p id="parish-search-error" className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </p>
      )}
      <div style={{ position: "relative" }}>
        <input
          className={`govuk-input${error ? " govuk-input--error" : ""}`}
          id="parish-search"
          name="parish-search"
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          aria-describedby={`parish-search-hint${
            error ? " parish-search-error" : ""
          }`}
          autoComplete="off"
        />
        {isSearching && (
          <div
            className="govuk-body-s govuk-!-margin-top-1"
            style={{ color: "#505a5f" }}
          >
            Searching...
          </div>
        )}
        {searchResults.length > 0 && !isSearching && (
          <ul
            className="govuk-list"
            style={{
              position: "absolute",
              zIndex: 1000,
              width: "100%",
              maxHeight: "300px",
              overflowY: "auto",
              backgroundColor: "white",
              border: "2px solid #0b0c0c",
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {searchResults.map((result) => (
              <li
                key={result.id}
                style={{
                  borderBottom: "1px solid #b1b4b6",
                }}
              >
                <button
                  type="button"
                  onClick={() => onAddParish(result)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: "12px 15px",
                    cursor: "pointer",
                    fontSize: "19px",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1d70b8";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "inherit";
                  }}
                >
                  {result.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ParishSearch;
