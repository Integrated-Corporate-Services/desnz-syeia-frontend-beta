import React from "react";
import { Link, useParams } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";
import ParishesTable from "../components/ParishesTable";
import ParishSearch from "../components/ParishSearch";
import { useParishSearch } from "../hooks/useParishSearch";
import { useParishes } from "../hooks/useParishes";
import { useParishSubmit } from "../hooks/useParishSubmit";

const Parishes: React.FC = () => {
  const params = useParams();
  const applicationId = params.applicationId || params.id || "";

  const { parishes, addParish, removeParish, isLoading, loadError } =
    useParishes(applicationId);
  const {
    searchTerm,
    searchResults,
    isSearching,
    handleSearchChange,
    clearSearch,
  } = useParishSearch();
  const { validationError, isSubmitting, handleSubmit } =
    useParishSubmit(applicationId);

  const handleRemoveParish = (
    e: React.MouseEvent<HTMLAnchorElement>,
    parishId: string
  ) => {
    e.preventDefault();
    removeParish(parishId);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
  };

  const handleAddParish = (parish: any) => {
    addParish(parish);
    clearSearch();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(parishes);
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
            {loadError && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
              >
                <div role="alert">
                  <h2 className="govuk-error-summary__title">
                    There is a problem
                  </h2>
                  <div className="govuk-error-summary__body">
                    <ul className="govuk-list govuk-error-summary__list">
                      <li>{loadError}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {validationError && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
              >
                <div role="alert">
                  <h2 className="govuk-error-summary__title">
                    There is a problem
                  </h2>
                  <div className="govuk-error-summary__body">
                    <ul className="govuk-list govuk-error-summary__list">
                      <li>
                        <a href="#parish-search">{validationError}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-xl">Parishes</h1>

            {isLoading ? (
              <p className="govuk-body">Loading saved parishes...</p>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <ParishesTable
                  parishes={parishes}
                  onRemove={handleRemoveParish}
                />

                <ParishSearch
                  searchTerm={searchTerm}
                  searchResults={searchResults}
                  isSearching={isSearching}
                  onSearchChange={handleSearchInputChange}
                  onAddParish={handleAddParish}
                  error={validationError}
                />

                <button
                  type="submit"
                  data-module="govuk-button"
                  className="govuk-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save and continue"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Parishes;
