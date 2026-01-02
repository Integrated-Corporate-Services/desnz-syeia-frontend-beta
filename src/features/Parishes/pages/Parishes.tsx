import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";
import { Parish } from "../types/Parish";
import ParishesTable from "../components/ParishesTable";
import ParishSearch from "../components/ParishSearch";

const Parishes: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const applicationId = params.applicationId || params.id;

  const [parishes, setParishes] = useState<Parish[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Parish[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleRemoveParish = (
    e: React.MouseEvent<HTMLAnchorElement>,
    parishId: string
  ) => {
    e.preventDefault();
    setParishes(parishes.filter((p) => p.id !== parishId));
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 3) {
      setIsSearching(true);
      try {
        const response = await fetch(`/backend/api/parish/search?q=${value}`);
        const data = await response.json();

        // API returns { query, count, data: [...] }
        // Map API response (parish_code, parish_name) to frontend format (id, name)
        const mappedResults = (data.data || []).map((parish: any) => ({
          id: parish.parish_code,
          name: parish.parish_name,
          county: parish.country,
        }));
        setSearchResults(mappedResults);
      } catch (error) {
        console.error("Error searching parishes:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddParish = (parish: Parish) => {
    if (!parishes.find((p) => p.id === parish.id)) {
      setParishes([...parishes, parish]);
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Save parishes to backend
      const parishCodes = parishes.map((p) => p.id);
      const response = await fetch(
        `/backend/api/applications/${applicationId}/parishes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ parish_codes: parishCodes }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save parishes");
      }

      const result = await response.json();
      console.log("Parishes saved:", result);

      // Navigate to task list
      navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
    } catch (error) {
      console.error("Error saving parishes:", error);
      alert("Failed to save parishes. Please try again.");
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item" aria-current="false">
              <Link
                className="govuk-breadcrumbs__link"
                to={`${S37_BASE_URL}/${applicationId}/task-list`}
              >
                Task list
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="true">
              Parishes
            </li>
          </ol>
        </nav>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Parishes</h1>

            <form onSubmit={handleSubmit} noValidate>
              <ParishesTable
                parishes={parishes}
                onRemove={handleRemoveParish}
              />

              <ParishSearch
                searchTerm={searchTerm}
                searchResults={searchResults}
                isSearching={isSearching}
                onSearchChange={handleSearchChange}
                onAddParish={handleAddParish}
              />

              <button
                type="submit"
                data-module="govuk-button"
                className="govuk-button"
              >
                Save and continue
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Parishes;
