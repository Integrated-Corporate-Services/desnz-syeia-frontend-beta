import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Application } from '../types/application';
import type { AuthUser } from '../types/auth';
import { ROLES } from '../constants/roles';

/**
 * Hook to determine if application should be read-only
 * Returns true if application is submitted AND user is not a DESNZ admin
 */
export const useApplicationReadOnly = (
  application: Application | null | undefined,
  user: AuthUser | null | undefined
): boolean => {
  const isSubmitted = application?.status?.toLowerCase() === 'submitted';
  const isAdmin = user?.role === ROLES.SUPERUSER;
  
  // Application is read-only if submitted AND user is not an admin
  return isSubmitted && !isAdmin;
};

/**
 * Hook to prevent editing of submitted applications
 * Redirects to task list if application is submitted and user is not admin
 */
export const usePreventEditSubmitted = (
  application: Application | null | undefined,
  applicationId: string | undefined,
  taskListPath: string,
  user?: AuthUser | null
) => {
  const navigate = useNavigate();
  const isReadOnly = useApplicationReadOnly(application, user);

  useEffect(() => {
    if (isReadOnly) {
      // Redirect to task list if application is submitted and user cannot edit
      navigate(taskListPath, { replace: true });
    }
  }, [isReadOnly, navigate, taskListPath]);

  return { isReadOnly };
};
