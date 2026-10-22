import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Application } from '../types/application';
import type { AuthUser } from '../types/auth';
import { ROLES } from '../constants/roles';

/**
 * Hook to determine if application should be read-only
 * Superusers can only view applicant applications, including drafts.
 */
export const useApplicationReadOnly = (
  application: Application | null | undefined,
  user: AuthUser | null | undefined
): boolean => {
  const isSubmitted = application?.status?.toLowerCase() === 'submitted';
  return isSubmitted || user?.role === ROLES.SUPERUSER;
};

/**
 * Redirects read-only users to the application task list.
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
      navigate(taskListPath, { replace: true });
    }
  }, [isReadOnly, navigate, taskListPath]);

  return { isReadOnly };
};
