import React from "react";
import { useUserManagementDashboard } from "../../../hooks";
import { TabNavigation } from "../components/TabNavigation";
import { OrganisationsTab } from "../components/OrganisationsTab";
import { ActiveUsersTab } from "../components/ActiveUsersTab";
import { PendingRequestsTab } from "../components/PendingRequestsTab";
import "../../../styles/DashboardMobile.css";

const UserManagementDashboard: React.FC = () => {
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

  return (
    <div className="govuk-width-container user-management-dashboard">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l">User Management Dashboard</h1>
            <p className="govuk-body-m">
              Manage access request and users across all Distribution Network
              Operators.
            </p>

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
