import React, { useEffect, useState } from "react";
import { useApplicationStore } from "../../../store/useApplicationStore";
import { useNavigate } from "react-router-dom";
import ApplicationTable from "../components/ApplicationTable";
import { useAuthUserContext } from "../../../context/AuthUserContext";
import type { AuthUser } from "../../../types/auth";
import { ROUTES } from "../../../constants/routes";
import { ROLES } from "../../../constants/roles";
import { useWorkbasketFilters } from "../hooks/useWorkbasketFilters";
import { WorkbasketFilters } from "../components/WorkbasketFilters";
import { WorkbasketHeader } from "../components/WorkbasketHeader";
import { Pagination } from "../components/Pagination";
import { DEMO_USER_ID } from "../../../constants/demo";

const Workbasket = () => {
  // TODO: get from auth/session
  const { user } = useAuthUserContext();
  const created_by =
    (user as AuthUser)?.person_id ||
    (user as AuthUser)?.user_id ||
    DEMO_USER_ID;
  const applications = useApplicationStore((state) => state.applications);
  const loadApplications = useApplicationStore(
    (state) => state.loadApplications
  );
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use custom filter hook
  const {
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    searchText,
    setSearchText,
    filteredApplications,
    clearFilters,
  } = useWorkbasketFilters(applications);

  // Check if user has admin role
  const isAdmin =
    user &&
    ((user as AuthUser)?.role === ROLES.DESNZ_ADMIN ||
      (user as AuthUser)?.role === ROLES.DNO_TEAM_COORDINATOR);

  useEffect(() => {
    if (created_by && typeof created_by === "string") {
      loadApplications(created_by);
    }
  }, [created_by, loadApplications]);

  const handleStart = () => {
    navigate(ROUTES.NETWORK_OPERATOR_DETAILS);
  };

  return (
    <div className="govuk-width-container" style={{ marginTop: "40px" }}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <WorkbasketHeader
            onToggleFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            onDashboardClick={() => navigate("/admin/user-management")}
            showDashboard={!!isAdmin}
          />

          <WorkbasketFilters
            showFilters={showFilters}
            statusFilter={statusFilter}
            dateFilter={dateFilter}
            searchText={searchText}
            onStatusChange={setStatusFilter}
            onDateChange={setDateFilter}
            onSearchChange={setSearchText}
            onClearFilters={clearFilters}
          />

          {filteredApplications.length > 0 ? (
            <>
              <ApplicationTable
                applications={filteredApplications.slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(
                  filteredApplications.length / itemsPerPage
                )}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          ) : (
            <p>No applications found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workbasket;
