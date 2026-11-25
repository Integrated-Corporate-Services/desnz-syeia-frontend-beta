import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLES } from '../../../constants/roles';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import type { AuthUser } from '../../../types/auth';

/**
 * Wraps a migration page so that anyone who is not a Tech Admin is sent to their dashboard,
 * like ReportingDashboard does for Operational tasks.
 * The wrapped page's hooks (and API calls) only run for Tech Admins.
 */
export function withMigrationAdmin<P extends object>(Page: React.ComponentType<P>): React.FC<P> {
  const Guarded: React.FC<P> = (props) => {
    const { user, loading } = useAuthUserContext();

    if (loading) return null;
    const role = (user as AuthUser | null | undefined)?.role;
    if (role !== ROLES.TECH_ADMIN) return <Navigate to="/application-dashboard" replace />;
    return <Page {...props} />;
  };
  Guarded.displayName = `withMigrationAdmin(${Page.displayName || Page.name || 'Page'})`;
  return Guarded;
}
