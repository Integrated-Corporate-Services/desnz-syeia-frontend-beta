import { useState, useEffect } from "react";
import { useAuthUserContext } from "../context/AuthUserContext";
import { createLogger } from "../utils/logger";
import type { AuthUser } from "../types/auth";
import type { User } from "../types/user";
import userService from "../services/userService";
import { ROLES } from "../constants/roles";

const logger = createLogger("useManageUsers");

/**
 * Custom hook for managing users data and operations
 * @returns {Object} Users management state and operations
 */
export const useManageUsers = () => {
  const { user } = useAuthUserContext();
  const userRole = user?.role;
  const userOrganisation = user?.organisation_name;
  const userOrganisationId = user?.organisation_id;
  const currentUserId = user?.user_id;
  const isDesnzAdminRole = user?.role === ROLES.DESNZ_ADMIN;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRevokeWarning, setShowRevokeWarning] = useState<string | null>(
    null
  );

  // Load users data
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await userService.getUsers(
          isDesnzAdminRole ? null : userOrganisation || null
        );
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          setError("Failed to load users");
        }
      } catch (error) {
        logger.error("Error loading users:", error);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    // Only load if user is authenticated
    if (user) {
      loadUsers();
    } else {
      logger.debug("User not loaded yet, skipping API call");
    }
  }, [user, userOrganisation, isDesnzAdminRole]);

  // Computed values - Filter out current user and apply organisation filter if needed
  const filteredUsers = users.filter((u) => u.id !== currentUserId);

  const activeCount = filteredUsers.filter((u) => u.status === "ACTIVE").length;
  const inactiveCount = filteredUsers.filter(
    (u) => u.status === "SUSPENDED" || u.status === "INACTIVE"
  ).length;
  const actionColumnCount = isDesnzAdminRole ? 7 : 6;

  // Handler functions
  const handleRevokeAccess = (userId: string) => {
    setShowRevokeWarning(userId);
  };

  const confirmRevokeAccess = async (
    userId: string,
    onSuccess: (data: { userName: string; userEmail: string }) => void
  ) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      try {
        const response = await userService.suspendUser(
          userId,
          "Access revoked by administrator",
          userOrganisationId
        );
        if (response.success) {
          // Reload users to reflect the change
          const usersResponse = await userService.getUsers(
            isDesnzAdminRole ? null : userOrganisation || null
          );
          if (usersResponse.success && usersResponse.data) {
            setUsers(usersResponse.data);
          }
          // Navigate to confirmation page with user details
          onSuccess({
            userName: user.fullName,
            userEmail: user.email,
          });
        } else {
          setError(response.message || "Failed to revoke user access");
        }
      } catch (error) {
        logger.error("Failed to revoke access:", error);
        setError("Failed to revoke user access");
      }
    }
    setShowRevokeWarning(null);
  };

  const cancelRevoke = () => {
    setShowRevokeWarning(null);
  };

  return {
    // State
    users,
    filteredUsers,
    loading,
    error,
    showRevokeWarning,
    activeCount,
    inactiveCount,
    actionColumnCount,
    userRole,
    userOrganisation,
    // Handlers
    handleRevokeAccess,
    confirmRevokeAccess,
    cancelRevoke,
  };
};
