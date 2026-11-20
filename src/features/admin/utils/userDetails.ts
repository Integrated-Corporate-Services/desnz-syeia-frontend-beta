import { ROLES } from '../../../constants/roles';
import { formatDateAtTime } from '../../../utils/formatters';
import { USER_DETAILS_CONSTANTS } from '../constants/userManagementConstants';
import type { User } from '../../../types/user';

/** Last login as "22 February 2026 at 10:32am", or "Never". */
export const formatLastLogin = (lastLogin: string | null): string =>
  lastLogin ? formatDateAtTime(lastLogin) : USER_DETAILS_CONSTANTS.LAST_LOGIN_NEVER;

/** Active users list (SYEIA-2168 AC2): last login date only, as "05 March 2025", or "Never". */
export const formatLastLoginDate = (lastLogin: string | null): string =>
  lastLogin
    ? new Date(lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : USER_DETAILS_CONSTANTS.LAST_LOGIN_NEVER;

/** "Agent" or "Employee", from the user's agent flag (or their agent role when the flag is not loaded). */
export const formatApplicantType = (user: Pick<User, 'isAgent' | 'role'>): string =>
  user.isAgent || user.role === ROLES.APPLICANT_AGENT ? USER_DETAILS_CONSTANTS.AGENT : USER_DETAILS_CONSTANTS.EMPLOYEE;
