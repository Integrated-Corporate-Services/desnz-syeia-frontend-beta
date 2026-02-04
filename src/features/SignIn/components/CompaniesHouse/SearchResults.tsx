import React from "react";
import { CompanySearchResult } from "../../../../types/companiesHouse";

interface SearchResultsProps {
  results: CompanySearchResult[];
  onSelectCompany: (company: CompanySearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onSelectCompany,
}) => {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <h2 className="govuk-heading-m">
          {results.length} {results.length === 1 ? "result" : "results"} found
        </h2>
        <ul className="govuk-list search-results-list">
          {results.map((company) => (
            <li
              key={company.company_number}
              className="search-result-item"
              style={{ borderBottom: "1px solid #b1b4b6", padding: "20px 0" }}
            >
              <button
                type="button"
                className="govuk-link button-link"
                onClick={() => onSelectCompany(company)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#1d70b8",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "24px",
                  fontWeight: "bold",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                {company.title}
              </button>

              <div className="company-meta" style={{ marginTop: "10px" }}>
                <div style={{ marginBottom: "5px" }}>
                  <span className="govuk-visually-hidden">
                    Company number:{" "}
                  </span>
                  <strong style={{ fontWeight: "bold" }}>
                    {company.company_number}
                  </strong>
                  <span style={{ margin: "0 10px", color: "#b1b4b6" }}>|</span>
                  <span
                    className={`govuk-tag ${company.company_status === "active" ? "govuk-tag--green" : "govuk-tag--grey"}`}
                  >
                    {company.company_status.toUpperCase()}
                  </span>
                </div>

                {company.address_snippet && (
                  <p
                    className="govuk-body-s"
                    style={{
                      color: "#505a5f",
                      marginTop: "5px",
                      marginBottom: 0,
                    }}
                  >
                    {company.address_snippet}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default SearchResults;
