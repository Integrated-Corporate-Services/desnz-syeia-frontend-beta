import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ErrorSummary from "../../components/commonFormFields/ErrorSummary";
import { useAccessRequestStore } from "../../store/accessRequestStore";
import CompaniesHouseSearch from "./components/CompaniesHouse/CompaniesHouseSearch";
import { CompanySearchResult } from "../../types/companiesHouse";

const CompanyNamePage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useAccessRequestStore();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [agencyName, setAgencyName] = useState(formData.agencyName || "");
  const [companyNumber, setCompanyNumber] = useState(
    formData.companyNumber || "",
  );
  const [agencyAddress, setAgencyAddress] = useState(
    formData.agencyAddress || "",
  );
  const [error, setError] = useState<string>("");

  const handleCompanySelect = (company: CompanySearchResult | null) => {
    if (company) {
      setAgencyName(company.title);
      setCompanyNumber(company.company_number);
      setAgencyAddress(company.address_snippet);
      setError("");
    } else {
      setAgencyName("");
      setCompanyNumber("");
      setAgencyAddress("");
    }
  };

  const handleSearchError = (searchError: string) => {
    // Only update if different to avoid infinite loops, and ensure we capture search errors
    if (searchError !== error) {
      setError(searchError);
    }
  };

  const validate = (): boolean => {
    if (!agencyName.trim()) {
      setError("Search for and select your agency");
      return false;
    }

    if (agencyName.trim().length > 4000) {
      setError("You cannot enter more than 4,000 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
        errorSummaryRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      return;
    }

    updateFormData({ agencyName, companyNumber, agencyAddress });
    navigate("/request-access/select-organisations");
  };

  const errorSummaryItems = error
    ? [{ fieldId: "company-search", message: error }]
    : [];

  return (
    <div className="govuk-width-container">
      <a
        href="/request-access/agent-question"
        className="govuk-back-link"
        onClick={(e) => {
          e.preventDefault();
          navigate("/request-access/agent-question");
        }}
      >
        Back
      </a>

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary ref={errorSummaryRef} errors={errorSummaryItems} />

            <h1 className="govuk-heading-l">What is your agency's name?</h1>

            <CompaniesHouseSearch
              onCompanySelect={handleCompanySelect}
              onError={handleSearchError}
              initialValue={agencyName}
              hint="Search for your agency in the Companies House register."
            />

            <div className="govuk-button-group" style={{ marginTop: "30px" }}>
              <button
                onClick={handleSubmit}
                className="govuk-button"
                data-module="govuk-button"
              >
                Save and continue
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyNamePage;
