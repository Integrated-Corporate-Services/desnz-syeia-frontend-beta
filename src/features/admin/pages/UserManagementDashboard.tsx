import React from "react";
import { useUserManagementDashboard } from "../../../hooks";
import { TabNavigation } from "../components/TabNavigation";
import { OrganisationsTab } from "../components/OrganisationsTab";
import { ActiveUsersTab } from "../components/ActiveUsersTab";
import { PendingRequestsTab } from "../components/PendingRequestsTab";
import "../../../styles/DashboardMobile.css";
import PageTitle from "../../../components/PageTitle";

const UserManagementDashboard: React.FC = () => {
  const {
    isDesnzAdmin,
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
    organisationSearchInput,
    setOrganisationSearchInput,
    handleOrganisationSearch,
  } = useUserManagementDashboard();

  return (
    <>
      <PageTitle title="User management dashboard" />
            <div className="govuk-width-container user-management-dashboard">
              <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l">User Management Dashboard</h1>
            <p className="govuk-body-m">
              {isDesnzAdmin
                ? "Manage access requests and users across all Distribution Network Operators."
                : "Manage access requests and users for your organisation."}
            </p>

            {activeTab === "organisations" && (
              <form
                className="govuk-!-margin-top-6 govuk-!-margin-bottom-6"
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleOrganisationSearch();
                }}
              >
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3">
                  Search for a user
                </h2>
                <div className="govuk-form-group govuk-!-margin-bottom-3">
                  <label className="govuk-visually-hidden" htmlFor="organisation-search">
                    Organisation name
                  </label>
                  <input
                    className="govuk-input govuk-input--width-20"
                    id="organisation-search"
                    name="organisationSearch"
                    type="search"
                    placeholder="Organisation name"
                    value={organisationSearchInput}
                    onChange={(event) => setOrganisationSearchInput(event.target.value)}
                  />
                </div>
                <button className="govuk-button govuk-!-margin-bottom-0" type="submit">
                  Search
                </button>
              </form>
            )}

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
          </div>
    </>
  );
};

export default UserManagementDashboard;
