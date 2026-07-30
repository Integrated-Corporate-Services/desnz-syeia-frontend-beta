import { useState } from "react";
import { useManageUsers } from "./useManageUsers";
import { useManageUsersNavigation } from "./useManageUsersNavigation";
import { useDashboard } from "./useDashboard";
import { useOrganisations } from "./useOrganisations";
import { useAuthUserContext } from "../context/AuthUserContext";
import type { AuthUser } from "../types/auth";
import { ROLES } from "../constants/roles";

export const useUserManagementDashboard = () => {
  const { user } = useAuthUserContext();
  const userRole = (user as AuthUser)?.role || "";
  const isDesnzAdmin = userRole === ROLES.DESNZ_ADMIN;

  const [activeTab, setActiveTab] = useState<
    "organisations" | "active-users" | "pending-requests"
  >("pending-requests");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    filteredUsers,
    loading: usersLoading,
    error: usersError,
    confirmRevokeAccess,
  } = useManageUsers();

  const {
    navigateToAccessRevoked,
    navigateToReviewRequest,
    navigateToRevokeUser,
  } = useManageUsersNavigation();

  const {
    pendingRequests,
    loading: requestsLoading,
    error: requestsError,
    getStatValue,
  } = useDashboard(userRole);

  const {
    organisations,
    loading: organisationsLoading,
    error: organisationsError,
  } = useOrganisations();

  const activeUsers = filteredUsers.filter((u) => u.status === "ACTIVE");
  const totalResults =
    activeTab === "active-users"
      ? activeUsers.length
      : activeTab === "pending-requests"
      ? pendingRequests.length
      : activeTab === "organisations"
      ? organisations.length
      : 0;
  const pendingCount = getStatValue("pendingRequests");

  // Pagination logic
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = activeUsers.slice(startIndex, endIndex);
  const paginatedRequests = pendingRequests.slice(startIndex, endIndex);

  const handleExportCSV = () => {
    const csvData = activeUsers.map((user) => ({
      Name: user.fullName,
      Email: user.email,
      Role: user.role,
      Status: user.status,
      "Last login": user.lastLogin || "Never",
    }));

    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `active-users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleTabChange = (
    tab: "organisations" | "active-users" | "pending-requests"
  ) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return {
    // User context
    isDesnzAdmin,
    userRole,

    // Tab state
    activeTab,
    handleTabChange,
    showFilters,
    toggleFilters,

    // Pagination
    currentPage,
    totalPages,
    handlePageChange,
    itemsPerPage,

    // Users data
    paginatedUsers,
    activeUsers,
    usersLoading,
    usersError,
    handleExportCSV,

    // Requests data
    paginatedRequests,
    pendingRequests,
    pendingCount,
    requestsLoading,
    requestsError,

    // Organisations data
    organisations,
    organisationsLoading,
    organisationsError,

    // Navigation
    navigateToReviewRequest,
    navigateToRevokeUser,

    // Computed values
    totalResults,
  };
};
