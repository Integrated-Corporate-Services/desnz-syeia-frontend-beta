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
  
  const [parishes, setParishes] = useState<Parish[]>([
    { id: "1740", name: "Burton in Lonsdale (North Yorkshire)" }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Parish[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleRemoveParish = (e: React.MouseEvent<HTMLAnchorElement>, parishId: string) => {
    e.preventDefault();
    setParishes(parishes.filter(p => p.id !== parishId));
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 3) {
      setIsSearching(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/backend/api/parishes/search?q=${value}`);
        // const data = await response.json();
        // setSearchResults(data);
        setSearchResults([]);
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
    if (!parishes.find(p => p.id === parish.id)) {
      setParishes([...parishes, parish]);
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save parishes data
    // const parishIds = parishes.map(p => p.id);
    // await saveParishes(applicationId, parishIds);
    navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item" aria-current="false">
              <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
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
              <ParishesTable parishes={parishes} onRemove={handleRemoveParish} />

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
