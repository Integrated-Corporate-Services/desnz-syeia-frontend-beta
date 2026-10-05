import { SUPERUSER, APPLICANT_TEAM_COORDINATOR } from '../../../utils/roleUtils';

export const REASSIGNMENT_JUSTIFICATION_LIMIT = 2000;
const TERMINAL_STATUSES = new Set([
    'COMPLETED',
    'WITHDRAWN',
    'CLOSED',
    'ARCHIVED',
    'INVALID',
    'REJECTED',
]);
export const normalizeAssignmentStatus = (status: string | null) =>
    (status || '').trim().toUpperCase().replaceAll(' ', '_');
export const isReassignmentTerminal = (status: string | null) =>
    TERMINAL_STATUSES.has(normalizeAssignmentStatus(status));
export const hasReassignmentRole = (role: string | undefined) =>
    role === SUPERUSER || role === APPLICANT_TEAM_COORDINATOR;
