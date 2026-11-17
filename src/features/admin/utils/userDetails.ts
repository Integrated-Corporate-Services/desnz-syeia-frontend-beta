import { ROLES } from '../../../constants/roles';
import { formatDateAtTime } from '../../../utils/formatters';
import { USER_DETAILS_CONSTANTS } from '../constants/userManagementConstants';
import type { User } from '../../../types/user';

/** Last login as "22 February 2026 at 10:32am", or "Never". */
export const formatLastLogin = (lastLogin: string | null): string =>
  lastLogin ? formatDateAtTime(lastLogin) : USER_DETAILS_CONSTANTS.LAST_LOGIN_NEVER;

/** "Agent" or "Employee", from the user's agent flag (or their agent role when the flag is not loaded). */
export const formatApplicantType = (user: Pick<User, 'isAgent' | 'role'>): string =>
  user.isAgent || user.role === ROLES.APPLICANT_AGENT ? USER_DETAILS_CONSTANTS.AGENT : USER_DETAILS_CONSTANTS.EMPLOYEE;
