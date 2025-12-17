import { useState, useEffect } from 'react';
import { useAuthUserContext } from '../context/AuthUserContext';
import { createLogger } from '../utils/logger';
import type { AuthUser } from '../types/auth';
import type { User } from '../types/user';
import userService from '../services/userService';

const logger = createLogger('useManageUsers');

/**
 * Custom hook for managing users data and operations
 * @returns {Object} Users management state and operations
 */
export const useManageUsers = () => {
  const { user } = useAuthUserContext();
  const userRole = user?.role;
  const userOrganisation = user?.organisation_name;
  const isSuperUserRole = user?.role === 'SUPERUSER';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRevokeWarning, setShowRevokeWarning] = useState<string | null>(null);

  // Load users data
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await userService.getUsers(
          isSuperUserRole ? null : userOrganisation || null
        );
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          setError('Failed to load users');
        }
      } catch (error) {
        logger.error('Failed to load users:', error);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [userOrganisation, isSuperUserRole]);

  // Computed values - API already filters by organisation, no need to filter again
  const filteredUsers = users;

  const activeCount = filteredUsers.filter(u => u.status === 'ACTIVE').length;
  const inactiveCount = filteredUsers.filter(u => u.status === 'SUSPENDED' || u.status === 'INACTIVE').length;
  const actionColumnCount = isSuperUserRole ? 7 : 6;

  // Handler functions
  const handleRevokeAccess = (userId: string) => {
    setShowRevokeWarning(userId);
  };

  const confirmRevokeAccess = async (userId: string, onSuccess: (data: { userName: string; userEmail: string }) => void) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      try {
        const response = await userService.suspendUser(userId, 'Access revoked by administrator');
        if (response.success) {
          // Navigate to confirmation page with user details
          onSuccess({
            userName: user.fullName,
            userEmail: user.email
          });
        } else {
          setError('Failed to revoke user access');
        }
      } catch (error) {
        logger.error('Failed to revoke access:', error);
        setError('Failed to revoke user access');
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
    cancelRevoke
  };
};
