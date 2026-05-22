import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUserManagementDashboard } from "../../../hooks";
import LoadingSkeleton from "../../../components/shared/LoadingSkeleton";
import { TabNavigation } from "../components/TabNavigation";
// import { FilterSection } from "../components/FilterSection";
import { OrganisationsTab } from "../components/OrganisationsTab";
import { ActiveUsersTab } from "../components/ActiveUsersTab";
import { PendingRequestsTab } from "../components/PendingRequestsTab";
import "../../../styles/DashboardMobile.css";

const UserManagementDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    activeTab,
    // showFilters,
    currentPage,
    totalPages,
    handleTabChange,
    // toggleFilters,
    handlePageChange,
    totalResults,
    usersError,
    usersLoading,
    paginatedUsers,
    pendingRequests,
    requestsError,
    requestsLoading,
    paginatedRequests,
    navigateToReviewRequest,
    navigateToRevokeUser,
    organisations,
    organisationsLoading,
    organisationsError,
  } = useUserManagementDashboard();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality can be implemented here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l">User Management Dashboard</h1>
            <p className="govuk-body-m">
              Manage access request and users across all Distribution Network
              Operators.
            </p>

            {/* Search section */}
            <div className="user-search-section govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-m">Search for a user</h2>
              <form onSubmit={handleSearch}>
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="search-organisation">
                    Organisation name
                  </label>
                  <input
                    className="govuk-input govuk-!-width-full"
                    id="search-organisation"
                    name="search-organisation"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-describedby="search-hint"
                  />
                </div>
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                >
                  Search
                </button>
              </form>
            </div>

            <TabNavigation
              activeTab={activeTab}
              pendingCount={pendingRequests.length}
              onTabChange={handleTabChange}
              style={{ marginTop: "0", marginBottom: "0", width: "100%" }}
            />

            {activeTab === "organisations" && (
              <OrganisationsTab
                organisations={organisations}
                loading={organisationsLoading}
                error={organisationsError}
              />
            )}

            {activeTab === "active-users" && (
              <ActiveUsersTab
                totalResults={totalResults}
                usersError={usersError}
                usersLoading={usersLoading}
                paginatedUsers={paginatedUsers}
                navigateToRevokeUser={navigateToRevokeUser}
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            )}

            {activeTab === "pending-requests" && (
                <PendingRequestsTab
                  pendingRequests={pendingRequests}
                  requestsError={requestsError}
                  requestsLoading={requestsLoading}
                  paginatedRequests={paginatedRequests}
                  navigateToReviewRequest={navigateToReviewRequest}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagementDashboard;
